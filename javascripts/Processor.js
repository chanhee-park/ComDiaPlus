const Processor = new function () {
    let that = this;

    this.getDiagnosisMatrix = function (base_model_name) {
        let base_result = DATA.MODELS_PREDICTION[base_model_name]['predict'];

        let err_matrix = [];

        for (let digit = 0; digit < 10; digit++) {
            err_matrix[digit] = _.fill(new Array(10), 0);
        }

        _.forEach(base_result, (res) => {
            const digit = res['real'];
            const base_predict = res['pred'];
            const is_base_model_correct = digit === base_predict;

            if (!is_base_model_correct) {
                err_matrix[digit][base_predict] = err_matrix[digit][base_predict] + 1;
            }
        });

        return err_matrix;
    };

    this.getImproveInfoMatrix = function (base_model_name) {
        let base_result = DATA.MODELS_PREDICTION[base_model_name]['predict'];
        let other_model_names = [];
        let ret = [];

        _.forEach(CONSTANT.MODEL_NAMES, (model_name) => {
            if (model_name !== base_model_name) {
                other_model_names.push(model_name);
            }
        });

        for (let d = 0; d < 10; d++) {
            ret[d] = _.fill(new Array(10), []);
            for (let p = 0; p < 10; p++) {
                let e = {};
                _.forEach(other_model_names, (model_name) => {
                    e[model_name] = 0;
                });
                ret[d][p] = e;
            }
        }

        _.forEach(base_result, (res, i) => {
            let digit = res['real'];
            let base_pred = res['pred'];
            if (digit !== base_pred) {
                _.forEach(other_model_names, (model_name) => {
                    let compare_result = DATA.MODELS_PREDICTION[model_name]['predict'];
                    if (digit === compare_result[i]['pred']) {
                        ret[digit][base_pred][model_name]++;
                    }
                });
            }
        });

        return ret;
    };

    this.getImgsIdx = function (condition) {
        const c_model_name = condition.model_name;
        const c_digit = parseInt(condition.digit);
        const c_predict = parseInt(condition.predict);

        let result = DATA.MODELS_PREDICTION[c_model_name]['predict'];
        result = result.slice(c_digit * 1000, c_digit * 1000 + 1000);
        const idxs = [];

        _.forEach(result, (r, idx) => {
            const d = r['real'];
            const p = r['pred'];
            if (d === c_digit && p === c_predict) {
                idxs.push(idx)
            }
        });

        return idxs;
    };

    return this;
};
