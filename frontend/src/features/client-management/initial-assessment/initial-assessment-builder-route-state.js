export const INITIAL_ASSESSMENT_BUILDER_MODE = {
    NEW: 'new',
    TEMPLATE: 'template',
    EDIT: 'edit',
};

export const INITIAL_ASSESSMENT_BUILDER_QUERY_PARAM = {
    MODE: 'initialAssessment',
    TEMPLATE_ID: 'templateId',
    CLIENT_WORKOUT_ID: 'clientWorkoutId',
};

export function getInitialAssessmentBuilderRouteConfig(search) {
    const params = new URLSearchParams(search);
    const mode = params.get(INITIAL_ASSESSMENT_BUILDER_QUERY_PARAM.MODE);

    if (mode === INITIAL_ASSESSMENT_BUILDER_MODE.NEW) {
        return {
            clientWorkoutId: null,
            sourceWorkoutTemplateId: null,
        };
    }

    if (mode === INITIAL_ASSESSMENT_BUILDER_MODE.TEMPLATE) {
        const templateId = Number(params.get(INITIAL_ASSESSMENT_BUILDER_QUERY_PARAM.TEMPLATE_ID));

        return Number.isInteger(templateId) && templateId > 0
            ? {
                clientWorkoutId: null,
                sourceWorkoutTemplateId: templateId,
            }
            : null;
    }

    if (mode === INITIAL_ASSESSMENT_BUILDER_MODE.EDIT) {
        const clientWorkoutId = Number(params.get(INITIAL_ASSESSMENT_BUILDER_QUERY_PARAM.CLIENT_WORKOUT_ID),);

        return Number.isInteger(clientWorkoutId) && clientWorkoutId > 0
            ? {
                clientWorkoutId,
                sourceWorkoutTemplateId: null,
            }
            : null;
    }

    return null;
}