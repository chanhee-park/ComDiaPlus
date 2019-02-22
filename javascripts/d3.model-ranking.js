function modelRankingVis() {
    let that = this;

    const root = d3.select('#model-ranking-vis');

    const WIDTH = 1590;
    const HEIGHT = 320;

    const MARGIN_TOP = 90;
    const RANKING_VIS_HEIGHT = HEIGHT - MARGIN_TOP;
    const CELL_HEIGHT = RANKING_VIS_HEIGHT / (CONSTANT.MODEL_NAMES.length);
    const BAR_HEIGHT = CELL_HEIGHT * 0.6;
    const BAR_MARGIN_TOP = (CELL_HEIGHT - BAR_HEIGHT) / 2;
    const HEIGHT_RANKING_LINE_HEIGHT = CELL_HEIGHT * 0.75;

    const MARGIN_LEFT = CONSTANT.MARGIN_LEFT;
    const MARGIN_RIGHT = CONSTANT.MARGIN_RIGHT;
    const RANKING_VIS_WIDTH = WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
    const CELL_WIDTH = RANKING_VIS_WIDTH / 10;

    const TEXT_X_END = 50;

    const SPARK_LINE_MARGIN = 25;
    const SPARK_LINE_MARGIN_LEFT_ADDED = 10;
    const SPARK_LINE_INTERVAL = (MARGIN_LEFT - TEXT_X_END - (SPARK_LINE_MARGIN * 2) - 60) / 10;

    const CIRCLE_STROKE_WIDTH = 2;    //**CHANGED**//
    const SPARK_LINE_WIDTH = 3;
    const RANKING_STROKE_WIDTH = 10;

    const MIN_SCORE = 0.65;
    const MAX_RADIUS = CELL_HEIGHT / 2;

    let selected_model = null;

    const ranking_info = getRankingInfo('recall');
    draw(ranking_info, 'recall');

    // TODO : 트렌지션 적용 시키면 간지쩔탱
    this.sortRanking = function (criteria) {
        criteria = criteria === 'total accuracy' ? 'name' : criteria;
        const ranking_info = getRankingInfo(criteria);
        draw(ranking_info, criteria);
    };

    function draw(ranking_info, criteria) {
        removeAll();
        criteria = criteria === 'precision' ? criteria : 'recall';

        drawAxisInfo(criteria);

        // 각각의 모델을 순회하며 그린다.
        let modelCnt = 0;
        _.forEach(DATA.MODELS_PREDICTION, (predictionValue, modelName) => {
            const modelPerformance = predictionValue['performance'];
            const ranking_line = [];

            // 모델 이름을 적는다.
            const x = TEXT_X_END - SPARK_LINE_MARGIN;
            const y = MARGIN_TOP + (modelCnt * CELL_HEIGHT);
            root.append('text')
                .text(predictionValue['short_name'])
                .attrs({
                    x: x,
                    y: y + (CELL_HEIGHT / 2),
                    'text-anchor': 'start',
                    'alignment-baseline': 'middle',
                    'fill': '#333',
                    'font-size': CONSTANT.FONT_SIZE.default,
                })
                .classed(modelName, true);

            // 제목 셀의 하이라이팅을 위한 배경
            root.append('rect')
                .attrs({
                    x: 15,
                    y: MARGIN_TOP + (modelCnt * CELL_HEIGHT ) + (CELL_HEIGHT - HEIGHT_RANKING_LINE_HEIGHT) / 2,
                    width: MARGIN_LEFT - 60,
                    height: HEIGHT_RANKING_LINE_HEIGHT,
                    fill: CONSTANT.COLORS[modelName],
                    opacity: 0
                })
                .classed('cell-background', true)
                .classed('name-cell-background', true)
                .classed(modelName, true);

            // 짝수열 회색배경으로 구분
            if (modelCnt % 2 === 0) {
                root.append('rect')
                    .attrs({
                        x: 15,
                        y: MARGIN_TOP + (modelCnt * CELL_HEIGHT),
                        width: MARGIN_LEFT,
                        height: CELL_HEIGHT,
                        fill: '#eee',
                    })
                    .classed('cell-background', true);
            }

            ranking_line.push({
                x: MARGIN_LEFT - 45,
                y: y + (CELL_HEIGHT / 2)
            });
            ranking_line.push({
                x: MARGIN_LEFT - 15,
                y: y + (CELL_HEIGHT / 2)
            });

            // 각각의 클래스를 순회하며 그린다.
            for (let className = 0; className < 10; className++) {
                const ranking = ranking_info[className].indexOf(modelName);
                const x = MARGIN_LEFT + (className * CELL_WIDTH);
                const y = MARGIN_TOP + (ranking * CELL_HEIGHT);

                // 짝수열 회색 배경으로 구분
                if (ranking % 2 === 0) {
                    root.append('rect')
                        .attrs({
                            x: x,
                            y: y,
                            width: CELL_WIDTH,
                            height: CELL_HEIGHT,
                            fill: '#eee',
                        })
                        .classed('cell-background', true);
                }

                // 정답률을 표현한다.
                const recall = modelPerformance['recall'][className];
                const precision = modelPerformance['precision'][className];

                const percentage_recall = Math.round(100 * recall);
                const percentage_precision = Math.round(100 * precision);

                const r_recall = getRadiusByPerformance(recall);
                const r_precision = getRadiusByPerformance(precision);

                const cx = x + (CELL_WIDTH / 2);
                const cy = y + (BAR_HEIGHT / 2) + BAR_MARGIN_TOP;

                root.append('text')
                    .text(percentage_recall)
                    .attrs({
                        x: cx - 2,
                        y: cy,
                        'font-size': 12,
                        'text-anchor': 'end',
                        'alignment-baseline': 'middle',
                        'font-weight': 600,
                    })
                    .classed('performance-each', true)
                    .classed(modelName, true);

                root.append('text')
                    .text(percentage_precision)
                    .attrs({
                        x: cx + 2,
                        y: cy,
                        'font-size': 12,
                        'text-anchor': 'start',
                        'alignment-baseline': 'middle',
                        'font-weight': 600,
                    })
                    .classed('performance-each', true)
                    .classed(modelName, true);

                halfcircle(cx + CIRCLE_STROKE_WIDTH / 2, cy, r_recall - CIRCLE_STROKE_WIDTH / 2, modelName, 'left');
                halfcircle(cx - CIRCLE_STROKE_WIDTH / 2, cy, r_precision - CIRCLE_STROKE_WIDTH / 2, modelName, 'right');

                // 순위 변경선을 그린다.
                const nextClassName = className + 1;
                const next_ranking = className !== 9 ? ranking_info[nextClassName].indexOf(modelName) : ranking;

                ranking_line.push({
                    x: cx - 30,
                    y: cy
                });
                ranking_line.push({
                    x: cx + 30,
                    y: cy
                });
                if (className !== 9) {
                    ranking_line.push({
                        x: cx + CELL_WIDTH - 30,
                        y: MARGIN_TOP + (next_ranking * CELL_HEIGHT) + (BAR_HEIGHT / 2) + BAR_MARGIN_TOP
                    });
                    ranking_line.push({
                        x: cx + CELL_WIDTH + 30,
                        y: MARGIN_TOP + (next_ranking * CELL_HEIGHT) + (BAR_HEIGHT / 2) + BAR_MARGIN_TOP
                    });
                }
            }

            drawRankingPath(ranking_line, modelName);
            drawHeatMap(modelCnt, modelName, criteria);
            drawSparkLine(modelCnt, modelName, criteria);
            drawModelAccuracy(modelCnt, modelName);

            // add Interaction
            d3.selectAll('.' + modelName)
                .on("mouseover", function () {
                    mouseOn(modelName);
                })
                .on("mouseout", function () {
                    mouseOut(modelName);
                })
                .on("mousedown", function () {
                    mouseDown(modelName);
                });
            modelCnt++;
        });

        SortSvgObjs();
    }

    function drawAxisInfo(criteria) {
        // 클래스의 이름을 적는다.
        root.append('text')
            .text("ACTUAL CLASS")
            .attrs({
                x: WIDTH / 2,
                y: MARGIN_TOP - 50,
                'font-size': CONSTANT.FONT_SIZE.default,
                'fill': '#555',
                'text-anchor': 'middle',
                'alignment-baseline': 'hanging',
            });
        root.append('text')
            .text(criteria.toUpperCase() + " Spark Line")
            .attrs({
                x: TEXT_X_END + SPARK_LINE_MARGIN + SPARK_LINE_INTERVAL * 5,
                y: MARGIN_TOP - 20,
                'font-size': CONSTANT.FONT_SIZE.default,
                'fill': '#555',
                'text-anchor': 'middle',
                'alignment-baseline': 'hanging',
            });
        root.append('text')
            .text("Accuracy")
            .attrs({
                x: TEXT_X_END + SPARK_LINE_MARGIN * 3 + SPARK_LINE_INTERVAL * 10,
                y: MARGIN_TOP - 20,
                'font-size': CONSTANT.FONT_SIZE.default,
                'fill': '#555',
                'text-anchor': 'middle',
                'alignment-baseline': 'hanging',
            });
        for (let ClassName = 0; ClassName < 10; ClassName++) {
            const x = MARGIN_LEFT + CELL_WIDTH * ClassName + CELL_WIDTH / 2;
            root.append('text')
                .text(ClassName)
                .attrs({
                    x: x,
                    y: MARGIN_TOP - 20,
                    'font-size': CONSTANT.FONT_SIZE.default,
                    'fill': '#555',
                    'text-anchor': 'middle',
                    'alignment-baseline': 'hanging',
                });
        }
    }

    function drawRankingPath(lineData, model_name) {
        // This is the accessor function
        let lineBasis = d3.line()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            })
            .curve(d3.curveMonotoneX); // curveLinear
        root.append('path')
            .attr("d", lineBasis(lineData))
            .attrs({
                fill: 'none',
                stroke: CONSTANT.COLORS[model_name],
                'stroke-width': RANKING_STROKE_WIDTH,
            })
            .classed('ranking-change-line', true)
            .classed('selected', false)
            .classed(model_name, true)
    }

    function drawModelAccuracy(yi, modelName) {
        const performances = DATA.MODELS_PREDICTION[modelName]['performance'];
        const accuracy = performances['accuracy'];
        const percentage = Math.round(100 * accuracy);

        const cx = TEXT_X_END + SPARK_LINE_MARGIN * 3 + SPARK_LINE_INTERVAL * 10;
        const y = yi * CELL_HEIGHT + MARGIN_TOP;
        const cy = y + CELL_HEIGHT / 2;
        const r = getRadiusByPerformance(accuracy);

        root.append('circle')
            .attrs({
                cx: cx,
                cy: cy,
                r: r - CIRCLE_STROKE_WIDTH / 2,
                fill: '#fff',
                stroke: CONSTANT.COLORS[modelName],
                'stroke-width': CIRCLE_STROKE_WIDTH,
            })
            .classed("accuracy", true)
            .classed(modelName, true);

        root.append('text')
            .text(percentage)
            .attrs({
                x: cx,
                y: cy,
                'text-anchor': 'middle',
                'alignment-baseline': 'middle',
                'font-weight': 600,
            })
            .classed("accuracy", true)
            .classed(modelName, true);
    }

    function drawSparkLine(yi, modelName, criteria) {
        let lineData = [];
        let performances = DATA.MODELS_PREDICTION[modelName]['performance'][criteria];
        _.forEach(performances, (score, className) => {
            const redundancy_score = getRedundancy(score, MIN_SCORE);
            const x = (className * SPARK_LINE_INTERVAL) + (SPARK_LINE_INTERVAL / 2) + TEXT_X_END + SPARK_LINE_MARGIN + 10;
            const y_base = (yi * CELL_HEIGHT) + MARGIN_TOP + BAR_MARGIN_TOP + BAR_HEIGHT;
            const y = y_base - (redundancy_score * BAR_HEIGHT);
            lineData.push({ x, y });
        });

        // This is the accessor function
        let lineBasis = d3.line()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            })
            .curve(d3.curveLinear); // curveBasis

        // The line SVG Path we draw
        root.append("path")
            .attr("d", lineBasis(lineData))
            .attrs({
                fill: 'none',
                stroke: CONSTANT.COLORS[modelName],
                'stroke-width': SPARK_LINE_WIDTH,
            })
            .classed('spark-line', true)
            .classed(modelName, true);
    }

    function drawHeatMap(yi, modelName, criteria) {
        const y = yi * CELL_HEIGHT + MARGIN_TOP + BAR_MARGIN_TOP;
        root.append('rect').attrs({
            x: TEXT_X_END + SPARK_LINE_MARGIN + SPARK_LINE_MARGIN_LEFT_ADDED,
            y: y,
            width: SPARK_LINE_INTERVAL * 10,
            height: BAR_HEIGHT,
            fill: '#fff',
            stroke: '#777',
            'stroke-width': 1
        });
        let performances = DATA.MODELS_PREDICTION[modelName]['performance'][criteria];
        _.forEach(performances, (score, className) => {
            const color = getHexColorByPerformance(score);
            const x = TEXT_X_END + SPARK_LINE_MARGIN + SPARK_LINE_MARGIN_LEFT_ADDED + className * SPARK_LINE_INTERVAL;
            root.append('rect')
                .attrs({
                    x: x,
                    y: y,
                    width: SPARK_LINE_INTERVAL,
                    height: BAR_HEIGHT,
                    fill: color,
                })
                .classed('heat-map', true)
                .classed(modelName, true);
        });

    }

    function SortSvgObjs() {
        root.selectAll('.name-cell-background').raise();
        root.selectAll('.model-name').raise();
        root.selectAll('.ranking-change-line').raise();
        root.selectAll('.performance-each').raise();
        root.selectAll('.heat-map').raise();
        root.selectAll('.spark-line').raise();
        root.selectAll('.accuracy').raise();
        root.selectAll('text').raise();
    }

    /**
     * criteria 를 기준으로한 클래스별 모델 성능 순위를 돌려줍니다.
     * 반환하는 객체의 key 는 클래스, value 는 성능순 모델명 배열입니다.
     * @param criteria
     * @returns {{}}
     */
    function getRankingInfo(criteria) {
        let ranking_info = {};

        for (let className = 0; className < 10; className++) {
            ranking_info[className] = [];
            let models_score = [];
            _.forEach(CONSTANT.MODEL_NAMES, (model_name) => {
                models_score.push({
                    model_name,
                    score: DATA.MODELS_PREDICTION[model_name]['performance'][criteria][className]
                });
            });

            models_score = _.sortBy(models_score, [function (o) {
                return 1 - o.score;
            }]);

            _.forEach(models_score, (model_score) => {
                ranking_info[className].push(model_score['model_name']);
            });

        }
        return ranking_info;
    }

    function mouseOn(hover_model_name) {
        highlightModel(hover_model_name);
    }

    function mouseOut(de_hover_model_name) {
        deHighlightModel(de_hover_model_name);
        highlightModel(selected_model);
    }

    function mouseDown(model_name) {
        selected_model = model_name;

        deHighlightAllModel();
        highlightModel(selected_model);
        Components.MODEL_DIAGNOSIS_VIS.updateMatrix(model_name);
        // const prediction_changes = Processor.getPredictionChangeInfo(model_name);
        // Components.MODEL_RANKING_VIS.sortRanking('recall');
    }

    function highlightModel(model_name) {
        root.selectAll('.name-cell-background' + '.' + model_name).style("opacity", 1);
        root.selectAll('.ranking-change-line' + '.' + model_name).style("stroke-width", HEIGHT_RANKING_LINE_HEIGHT);
        root.selectAll('.performance-each.performance-circle' + '.' + model_name).style('stroke', '#000');
        root.selectAll('.performance-each.performance-circle' + '.' + model_name).style('stroke-width', CIRCLE_STROKE_WIDTH * 0.75);
    }

    function deHighlightModel(model_name) {
        const color = CONSTANT.COLORS[model_name];
        root.selectAll('.name-cell-background' + '.' + model_name).style("opacity", 0);
        root.selectAll('.ranking-change-line' + '.' + model_name).style("stroke-width", RANKING_STROKE_WIDTH);
        root.selectAll('.performance-each.performance-circle' + '.' + model_name).style('stroke', color);
        root.selectAll('.performance-each.performance-circle' + '.' + model_name).style('stroke-width', CIRCLE_STROKE_WIDTH);
    }

    function deHighlightAllModel() {
        _.forEach(CONSTANT.MODEL_NAMES, (model_name) => {
            deHighlightModel(model_name);
        });
    }

    function getRadiusByPerformance(performance) {
        let redundancy = getRedundancy(performance, MIN_SCORE);  // 0 ~ 1
        return redundancy * MAX_RADIUS;
    }

    function getHexColorByPerformance(performance) {
        // score 0.5 -> black (#000) // score 1 -> white (#fff)
        let redundancy = getRedundancy(performance, MIN_SCORE);

        const color_decimal = Math.round(256 * redundancy);
        let hex = color_decimal.toString(16);
        hex = hex.length > 1 ? hex : '0' + hex;

        return '#' + hex + hex + hex;
    }

    /**
     * min value ~ 1 사이의 값을 0 ~ 1 사이 값으로 변경해준다.
     * @param value
     * @param min_value
     * @returns {number}
     */
    function getRedundancy(value, min_value) {
        let redundancy = value - min_value;
        redundancy = redundancy / (1 - min_value);
        return redundancy;
    }

    function halfcircle(x, y, r, model_name, dir) {
        let rotate = dir === 'left' ? 180 : 0;
        let x_correction = dir === 'left' ? -1 : 1;

        let color_code = dir === 'left' ? CONSTANT.COLORS[model_name] : '#fff';
        const arc = d3.arc();
        return root.append('path')
            .attr('transform', 'translate(' + [x + x_correction, y] + ') rotate(' + rotate + ') ')
            .attr('d', arc({
                innerRadius: 0,
                outerRadius: r,
                startAngle: 0,
                endAngle: Math.PI,
            }))
            .attrs({
                stroke: CONSTANT.COLORS[model_name],
                'stroke-width': CIRCLE_STROKE_WIDTH,
                fill: color_code
            })
            .classed('performance-each', true)
            .classed('performance-circle', true)
            .classed(model_name, true);
    }

    function removeAll() {
        d3.selectAll('#model-ranking-vis > *').remove();
    }

    return that;
}
