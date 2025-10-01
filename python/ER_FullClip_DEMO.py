#!/usr/bin/env python
# coding: utf-8

import os, glob, json
import numpy as np
import keras
import moviepy.editor as mp
import cv2
import librosa
from joblib import load
import sys
from scipy.stats import spearmanr
# Labels dictionary
emotions = {0:'angry', 1:'calm', 2:'disgust', 3:'fear', 4:'happy', 5:'sad', 6:'surprise'}

# Paths
dataset_path = ""
haar_path = "../Emotion-Recognition_SER-FER_RAVDESS/Other/haarcascade_frontalface_default.xml"

parameters_path = "../Emotion-Recognition_SER-FER_RAVDESS/Datasets/RAVDESS_audio/std_scaler.bin"

models_video_path = "../Emotion-Recognition_SER-FER_RAVDESS/Models/Video Stream/"

models_audio_path = "../Emotion-Recognition_SER-FER_RAVDESS/Models/Audio Stream/"

# Audio video parameters
height_targ = 112
width_targ = 112
sr = 48000

# Load models once
models_list = os.listdir(models_video_path)
acc = [float(model.split('[')[1].split(']')[0]) for model in models_list]
idx = acc.index(max(acc))
model_video = keras.models.load_model(models_video_path + models_list[idx])

models_list = os.listdir(models_audio_path)
model_audio = keras.models.load_model(models_audio_path + models_list[0])

scaler = load(parameters_path)
haar_cascade = cv2.CascadeClassifier(haar_path)


def analyze_video(filename):
    """分析单个视频，返回结果JSON"""
    # --- Video ---
    cap = cv2.VideoCapture(filename)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))  # 总帧数
    target_frames = 50  # 想要采样的帧数
    interval = max(1, frame_count // target_frames)

    frames, count = [], 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        # 每隔 interval 取一帧
        if count % interval == 0:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = haar_cascade.detectMultiScale(gray, scaleFactor=1.12, minNeighbors=9)
            if len(faces) == 1:
                (x, y, w, h) = faces[0]
                face = gray[y:y+h, x:x+w]
                face = cv2.resize(face, (height_targ+10, width_targ+10))
                face = face[5:-5, 5:-5]
                face = face / 255.
                frames.append(face)
        count += 1
    cap.release()

    frames = np.array(frames)

    if frames.shape[0] == 0:
        return {
            "file": os.path.basename(filename),
            "error": "No valid face frames detected"
        }

    pred_video = model_video.predict(frames, verbose=0)
    pred_video = np.mean(pred_video, axis=0)

    # --- Audio ---
    audiofile = mp.AudioFileClip(filename).set_fps(sr)
    audio = audiofile.to_soundarray()
    audio = audio[int(sr/2):int(sr/2 + sr*3)]  # 截取中间3秒
    if len(audio) < sr * 3:
        audio = np.pad(audio, (0, sr * 3 - len(audio)), mode="constant")
    else:
        audio = audio[:sr * 3]
    audio = np.array([elem[0] for elem in audio])  # 取单声道

    mel = librosa.power_to_db(librosa.feature.melspectrogram(
        audio, sr=sr, n_fft=1024, n_mels=128, fmin=50, fmax=24000
    ))

    mel = scaler.transform(mel)  # shape -> (128, 282)

    mel = np.expand_dims(mel, axis=-1)  # (128, 282, 1)
    mel = np.expand_dims(mel, axis=0)   # (1, 128, 282, 1)

    pred_audio = model_audio.predict(mel, verbose=0)
    pred_audio = np.mean(pred_audio, axis=0)

    # --- Global ---
    pred_global = pred_video + pred_audio

    return {
        "file": os.path.basename(filename),
        "video": emotions[pred_video.argmax()],
        "audio": emotions[pred_audio.argmax()],
        "global": emotions[pred_global.argmax()]
    }




if __name__ == "__main__":
    target_path = sys.argv[1] if len(sys.argv) > 1 else dataset_path
    questionnaire_scores = []
    if len(sys.argv) > 2:
        try:
            questionnaire_scores = json.loads(sys.argv[2])
        except Exception:
            questionnaire_scores = []

    results = []
    video_files = glob.glob(os.path.join(target_path, "*.mp4"))
    if not video_files:
        print(json.dumps({"error": f"No video files found in {target_path}"}))
        sys.exit(0)

    # 情感类别映射（负面→0，正面→1）
    emotion_mapping = {
        "happy": 0.0,
        "surprise": 0.1,
        "calm": 0.2,
        "sad": 0.3,
        "fear": 0.5,
        "disgust": 0.7,
        "angry": 1.0
    }

    norm_emotion_scores = []
    for vf in video_files:
        try:
            res = analyze_video(vf)
            emo = res.get("global")
            score = emotion_mapping.get(emo, 0.5)
            norm_emotion_scores.append(round(score,2))
            results.append(res)
        except Exception as e:
            norm_emotion_scores.append(0.5)
            results.append({"file": os.path.basename(vf), "error": str(e)})

    # 问卷分数归一化 (0-3 → 0-1)
    norm_questionnaire_scores = [round(s/3.0,2) for s in questionnaire_scores]
    rho, pval = None, None
    if len(norm_questionnaire_scores) > 1 and len(norm_emotion_scores) > 1:
        rho, pval = spearmanr(norm_questionnaire_scores, norm_emotion_scores)
    # 最终输出 JSON
    output = {
        "videoResults": results,
        "normEmotionScores": norm_emotion_scores,
        "normQuestionnaireScores": norm_questionnaire_scores,
        "spearmanCorr": rho if rho is not None else None,
        "pValue": pval if pval is not None else None
    }
    print(json.dumps(output, indent=2), flush=True)
