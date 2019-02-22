const DATA = new function () {
    const that = this;
    let dataset = 'mnist';
    this.MODELS_PREDICTION   = {};

    this.load = async function () {
        for (let i = 0; i < CONSTANT.MODEL_NAMES.length; i++) {
            const model_name = CONSTANT.MODEL_NAMES[i];
            const file_dir = '../data/result2/' + dataset + '_' + model_name + '__result.json';
            that.MODELS_PREDICTION[model_name] = await $.getJSON(file_dir);
        }
        Components.MODEL_RANKING_VIS = modelRankingVis();
        Components.MODEL_DIAGNOSIS_VIS = modelDiagnosisVis();
        Components.INSTANCE_ANALYSIS_VIS = instanceAnalysisVis();
    };
};

DATA.load();

const Components = new function () {
    this.MODEL_RANKING_VIS = {};
    this.MODEL_DIAGNOSIS_VIS = {};
    this.INSTANCE_ANALYSIS_VIS = {};
    return this;
};