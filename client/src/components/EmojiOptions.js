import React from "react";
import "../components/survey.css";

/**
 * options: 原题目的字符串数组（用于展示文案）
 * value: 选中的 index（number | undefined）
 * onChange: (idx) => void
 *
 * 如果后台只有 4 个标准选项，会自动配 4 个表情。
 * 若不止 4 个，也会给前 N 个映射默认表情（重复循环）。
 */
const EMOJIS = ["🙂","😐","🙁","😫"];

export default function EmojiOptions({ options=[], value, onChange, name }) {
    return (
        <div className="emoji-grid">
            {options.map((txt, i) => {
                const picked = value === i;
                const emoji = EMOJIS[i % EMOJIS.length];
                return (
                    <button
                        key={i}
                        type="button"
                        className={`emoji-btn ${picked ? "emoji-btn--active":""}`}
                        onClick={() => onChange?.(i)}
                        onMouseEnter={()=>{}}
                        aria-pressed={picked}
                    >
                        <span className="emoji-ico" aria-hidden>{emoji}</span>
                        <span>{txt}</span>
                        <input
                            type="radio"
                            name={name}
                            checked={picked}
                            onChange={()=>onChange?.(i)}
                            hidden
                        />
                    </button>
                );
            })}
        </div>
    );
}
