function instanceAnalysisVis() {
    let that = this;

    const rep_area = d3.select('#representative-instance-vis');
    const list_area = d3.select('#instance-list-vis');

    const WIDTH = 310;
    const REP_AREA_HEIGHT = 400;
    let LIST_AREA_HEIGHT = 500;

    const AVG_IMG_LEN = WIDTH - 50;

    const NUM_OF_CELLS_IN_ROW = 8;
    const CELL_SIZE = (WIDTH - 20) / NUM_OF_CELLS_IN_ROW;
    const IMG_LEN = CELL_SIZE;

    const DIGIT_VIEW_TITLE_HEIGHT = 30;

    let imgs_idx = [];


    drawTitles();

    this.drawInstanceList = function (condition) {
        console.log("Draw Instance List");
        console.log(condition);
        imgs_idx = Processor.getImgsIdx(condition);
        LIST_AREA_HEIGHT = Math.ceil(imgs_idx.length / NUM_OF_CELLS_IN_ROW) * CELL_SIZE + DIGIT_VIEW_TITLE_HEIGHT;
        list_area.style('height', LIST_AREA_HEIGHT);
        drawConditionInfo(condition);
        drawAvgImg(condition.model_name, condition.digit, condition.predict);
        drawInstances(condition.digit, imgs_idx);
    };


    function drawTitles() {
        rep_area.append('text')
            .text("CONDITION")
            .attrs({
                x: 0,
                y: 20,
                'font-size': CONSTANT.FONT_SIZE.default,
                'font-weight': 700,
                fill: '#555',
                'text-anchor': 'start',
                'alignment-baseline': 'hanging',
            });

        rep_area.append('text')
            .text("DIGITS")
            .attrs({
                x: 0,
                y: REP_AREA_HEIGHT - DIGIT_VIEW_TITLE_HEIGHT / 2,
                fill: '#555',
                'text-anchor': 'start',
                'alignment-baseline': 'hanging',
                'font-size': CONSTANT.FONT_SIZE.default,
                'font-weight': 700,
            });
    }

    function drawConditionInfo(condition) {
        rep_area.selectAll(".analysis_vis.title").remove();

        rep_area.append('text')
            .text(DATA.MODELS_PREDICTION[condition.model_name]['model_name'])
            .attrs({
                x: 10,
                y: 60,
                'font-size': CONSTANT.FONT_SIZE.default,
                'font-weight': 400,
                fill: '#555',
                'text-anchor': 'hanging',
                'alignment-baseline': 'center',
            })
            .classed('analysis_vis', true)
            .classed("title", true);

        rep_area.append('text')
            .text("  Digit : " + condition.digit + " | Predict : " + condition.predict + " | " + Processor.getImgsIdx(condition).length + " Items")
            .attrs({
                x: 10,
                y: 80,
                'font-size': CONSTANT.FONT_SIZE.default,
                'font-weight': 400,
                fill: '#555',
                'text-anchor': 'hanging',
                'alignment-baseline': 'center',
            })
            .classed('analysis_vis', true)
            .classed("title", true);

    }

    function drawAvgImg(model_name, realClass, predClass) {
        rep_area.selectAll(".analysis_vis.avg_img").remove();

        const real_instance = _.filter(DATA.MODELS_PREDICTION[model_name]['predict'], function (o) {
            return o['real'] === realClass;
        });
        const real_pred_instance = _.filter(real_instance, function (o) {
            return o['pred'] === predClass;
        });
        const sorted_instance = _.sortBy(real_pred_instance, function (o) {
            return -o['pred_proba'][predClass]
        });

        for (let i = 0; i < 4; i++) {
            console.log(sorted_instance[i]);
            let maxInstanceIdx = DATA.MODELS_PREDICTION[that.model_name]['predict'].indexOf(sorted_instance[i]);
            maxInstanceIdx = maxInstanceIdx % 1000 + 1;
            const dir = "./data/mnist_png_testing/" + realClass + '/';
            const filename = realClass + "_" + maxInstanceIdx % 1000 + ".png";

            rep_area.append('image')
                .attrs({
                    "xlink:href": dir + filename,
                    x: i % 2 === 0 ? 10 : 20 + AVG_IMG_LEN / 2,
                    y: i < 2 ? 100 : 110 + AVG_IMG_LEN / 2,
                    width: AVG_IMG_LEN / 2,
                    height: AVG_IMG_LEN / 2,
                })
                .classed('analysis_vis', true)
                .classed('avg_img', true);
        }
    }

    this.selected = [];

    function drawInstances(instances, imgs_idx) {
        list_area.selectAll(".analysis_vis.instances").remove();
        let col = 0;

        _.forEach(imgs_idx, (img_idx, i) => {
            const row = i % NUM_OF_CELLS_IN_ROW;

            const file_dir = "./data/mnist_png_testing/" + instances + "/" + instances + "_" + (img_idx + 1) + ".png";
            list_area.append('image')
                .attrs({
                    "xlink:href": file_dir,
                    x: CELL_SIZE * row + 2,
                    y: CELL_SIZE * col + 2,
                    width: IMG_LEN - 4,
                    height: IMG_LEN - 4,
                })
                .on('mousedown',
                    function () {
                        that.selected.push(1000 * instances + img_idx);
                        console.log(that.selected);
                    })
                .classed("analysis_vis", true)
                .classed("instances", true);

            if ((i + 1) % NUM_OF_CELLS_IN_ROW === 0) {
                col += 1;
            }
        });
    }

    return that;
}
