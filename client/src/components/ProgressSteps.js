import React from "react";
import "../components/survey.css";

export default function ProgressSteps({ current=0, total=1 }) {
    const steps = Array.from({ length: total }, (_, i) => i);
    return (
        <div className="sv-steps">
            {steps.map((i) => (
                <React.Fragment key={i}>
                    <div className={`sv-step ${i===current ? "sv-step--active":""}`}>{i+1}</div>
                    {i < total-1 && <div className={`sv-link ${i < current ? "sv-link--fill":""}`} />}
                </React.Fragment>
            ))}
        </div>
    );
}
