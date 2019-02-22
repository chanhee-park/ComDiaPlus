function modelDiagnosisVis() {

    let that = this;

    const root = d3.select('#model-diagnosis-vis');

    const WIDTH = 1590;
    const HEIGHT = 800;

    const MARGIN_TOP = 10;
    const MARGIN_BOTTOM = 10;
    const MARGIN_LEFT = CONSTANT.MARGIN_LEFT;
    const MARGIN_RIGHT = CONSTANT.MARGIN_RIGHT;

    const SUMMATION_CELL_WIDTH = 70;
    const SUMMATION_CELL_START = MARGIN_LEFT - SUMMATION_CELL_WIDTH;

    const MATRIX_HEIGHT = HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;
    const MATRIX_WIDTH = WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

    const CELL_WIDTH = MATRIX_WIDTH / 10;
    const CELL_HEIGHT = MATRIX_HEIGHT / 10;

    const MAX_VAL_BAR = 270;
    const MAX_VAL = 103;

    const BAR_INTERVAL = (CELL_WIDTH - CELL_HEIGHT) / CONSTANT.MODEL_NAMES.length;

    this.improveInfo = {};
    this.model_name = null;
    this.diagnosis_matrix = null;

    this.updateMatrix = function (model_name) {
        that.model_name = model_name;
        that.improveInfo = Processor.getImproveInfoMatrix(model_name);
        that.diagnosis_matrix = Processor.getDiagnosisMatrix(model_name);
        draw()
    };

    drawAxis();
    drawCellArea();

    function drawAxis() {
        root.append('text')
            .text("PREDICTED CLASS")
            .attrs({
                x: SUMMATION_CELL_START - 100,
                y: HEIGHT / 2,
                'font-size': CONSTANT.FONT_SIZE.default,
                'fill': '#555',
                'text-anchor': 'middle',
                'alignment-baseline': 'ideographic',
                'writing-mode': 'tb',
                'glyph-orientation-vertical': 0,
            });
        for (let predict = 0; predict < 10; predict++) {
            const y = MARGIN_TOP + CELL_HEIGHT * predict + CELL_HEIGHT / 2;
            root.append('text')
                .text(predict)
                .attrs({
                    x: SUMMATION_CELL_START - 20,
                    y: y,
                    'font-size': CONSTANT.FONT_SIZE.default,
                    'fill': '#555',
                    'text-anchor': 'middle',
                    'alignment-baseline': 'middle',
                });
        }
    }

    function drawCellArea() {
        for (let predict = 0; predict < 10; predict++) {
            root.append('rect')
                .attrs({
                    x: SUMMATION_CELL_START,
                    y: MARGIN_TOP + (CELL_HEIGHT * predict),
                    width: SUMMATION_CELL_WIDTH,
                    height: CELL_HEIGHT,
                    fill: '#fff',
                    stroke: CONSTANT.COLORS.grid_stroke,
                });
            for (let digit = 0; digit < 10; digit++) {
                const x = MARGIN_LEFT + CELL_WIDTH * digit;
                const y = MARGIN_TOP + CELL_HEIGHT * predict;
                root.append('rect')
                    .attrs({
                        x: x,
                        y: y,
                        width: CELL_WIDTH,
                        height: CELL_HEIGHT,
                        fill: '#fff',
                        stroke: CONSTANT.COLORS.grid_stroke
                    })
                    .classed('axis', true)
                    .on("mousedown", function () {
                        mouseDown(digit, predict);
                    });
            }
        }
    }

    function draw() {
        root.selectAll('.matrix').remove();
        drawPredictSummationCells();
        drawDigitPredictCells();
    }

    function drawPredictSummationCells() {
        const matrix = that.diagnosis_matrix;

        for (let predict = 0; predict < 10; predict++) {
            let err_sum = 0;
            let improve_sum = {};

            for (let digit = 0; digit < 10; digit++) {
                err_sum += matrix[digit][predict];
                const improveInfos = that.improveInfo[digit][predict];

                _.forEach(improveInfos, (val, key) => {
                    if (improve_sum.hasOwnProperty(key)) {
                        improve_sum[key] += val;
                    } else {
                        improve_sum[key] = val;
                    }
                })
            }
            drawEachSummationCell(predict, err_sum, improve_sum);
        }
    }

    function drawEachSummationCell(predict, num_of_err, improve_info) {
        let i = 0;
        let err_y = num_of_err * CELL_HEIGHT / MAX_VAL_BAR;

        _.forEach(improve_info, (improvement, model_name) => {
            root.append('rect')
                .attrs({
                    x: SUMMATION_CELL_START + i * BAR_INTERVAL + 17,
                    y: MARGIN_TOP + (CELL_HEIGHT * predict) + CELL_HEIGHT - err_y,
                    width: BAR_INTERVAL * 4 / 5,
                    height: err_y,
                    stroke: '#999',
                    fill: '#fff',
                    'stroke-width': 1,
                })
                .classed('matrix', true);
            let y = improvement * CELL_HEIGHT / MAX_VAL_BAR;
            root.append('rect')
                .attrs({
                    x: SUMMATION_CELL_START + i * BAR_INTERVAL + 17,
                    y: MARGIN_TOP + (CELL_HEIGHT * predict) + CELL_HEIGHT - y,
                    width: BAR_INTERVAL * 4 / 5,
                    height: y,
                    fill: CONSTANT.COLORS[model_name]
                })
                .classed('matrix', true);
            i++;
        })
    }

    function drawDigitPredictCells() {
        const matrix = that.diagnosis_matrix;
        for (let className = 0; className < 10; className++) {
            for (let predict = 0; predict < 10; predict++) {
                let numOfItemAtCell = matrix[className][predict];
                drawEachCell(className, predict, numOfItemAtCell);
            }
        }
    }

    function drawEachCell(realClass, predClass, numOfItem) {
        if (numOfItem <= 0) {
            return;
        }
        const MIN_LEN = 5;
        let len = (numOfItem * CELL_HEIGHT) / ( MAX_VAL + MIN_LEN) + MIN_LEN;

        const cell_x = MARGIN_LEFT + (realClass * CELL_WIDTH);
        const cell_y = MARGIN_TOP + (CELL_HEIGHT * predClass);
        const x = cell_x + ((CELL_HEIGHT - len) / 2);
        const y = cell_y + (CELL_HEIGHT - len) - 1;

        const real_instance = _.filter(DATA.MODELS_PREDICTION[that.model_name]['predict'], function (o) {
            return o['real'] === realClass;
        });
        const real_pred_instance = _.filter(real_instance, function (o) {
            return o['pred'] === predClass;
        });
        const sorted_instance = _.sortBy(real_pred_instance, function (o) {
            return -o['pred_proba'][predClass]
        });
        let maxInstanceIdx = DATA.MODELS_PREDICTION[that.model_name]['predict'].indexOf(sorted_instance[0]);

        maxInstanceIdx = maxInstanceIdx % 1000 + 1;
        const dir = "./data/mnist_png_testing/" + realClass + '/';
        const filename = realClass + "_" + maxInstanceIdx % 1000 + ".png";

        root.append('image')
            .attrs({
                "xlink:href": dir + filename,
                x: x,
                y: y,
                width: len,
                height: len,
            })
            .classed('matrix', true);
    }

    function mouseDown(digit, predict) {
        console.log("Click");
        if (digit === predict) {
            return;
        }
        if (that.model_name === null) {
            return;
        }
        const model_name = that.model_name;
        const condition = { model_name, digit, predict };

        Components.INSTANCE_ANALYSIS_VIS.drawInstanceList(condition)
    }

    return that;
}

// setTimeout(function () {
//     Components.INSTANCE_ANALYSIS_VIS.drawInstanceList(
//         { 'model_name': 'knn', 'digit': 4, 'predict': 9 }
//     );
// }, 500);
