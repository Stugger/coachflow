function IntakeHeader({progress, exitIntake}) {
    return (
        <>
            <div className="intake-header">
                <h3 className="intake-step-title">
                    New Client Intake
                </h3>
                <button type="button"
                        className="danger-button intake-exit-button"
                        onClick={exitIntake}
                >
                    ×
                </button>
                <div className="intake-progress">
                    {progress}
                </div>
            </div>
            <div className="section-divider spaced"></div>
        </>
    );
}

export default IntakeHeader;