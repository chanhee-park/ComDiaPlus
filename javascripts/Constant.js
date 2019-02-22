const CONSTANT = new function () {
    const that = this;

    this.MARGIN_LEFT = 300;
    this.MARGIN_RIGHT = 20;

    this.FONT_SIZE = {
        'default': 16,
        'large': 28,
    };

    this.MODEL_NAMES = ['cnn', 'rfc_50', 'nn_5-layers', 'nn_3-layers', 'rfc_25', 'slp', 'rfc_10', 'nn_10-layers'];

    // this.MODEL_NAMES = [
    //     'rfc_50', 'nn_5-layers', 'nn_3-layers',
    //     'rfc_25', 'rfc_10', 'nn_10-layers'
    // ];

    this.COLORS = {
        'true': '#4363d8',
        'false': '#e6194B',
        // 'improve': '#4363d8',
        'improve': '#a2a2c3',
        'correct-both': '#83a3e8',
        'recall': '#2B98F0',
        'precision': '#50AD55',
        'worsen': '#e6194B',
        'wrong-both': '#ff699b',
        'not-focus': '#777',
        'knn': '#7db',
        'neural_network': '#db7',
        'random_forest': '#cad',
        'softmax_regression': '#9c7',
        'stacked_autoencoder': '#e9a',
        'grid_stroke': '#bbb',
    };

    // 수도권 지하철 노선도 1호선 ~ 5호선 (표준)
    // ref. 서울특별시 디자인서울총괄본부. 《지하철정거장 환경디자인 가이드라인》. 서울특별시. 34p쪽
    function color_mode_2() {
        that.COLORS['stacked_autoencoder'] = '#0052a4';
        that.COLORS['neural_network'] = '#009D3E';
        that.COLORS['random_forest'] = '#EF7C1C';
        that.COLORS['softmax_regression'] = '#00A5DE';
        that.COLORS['knn'] = '#996CAC';
    }

    //5 color rainbow scheme
    function color_mode_3() {
        that.COLORS['stacked_autoencoder'] = '#996CAC';
        that.COLORS['neural_network'] = '#6ca2ea';
        that.COLORS['random_forest'] = '#b5d33d';
        that.COLORS['softmax_regression'] = '#fed23f';
        that.COLORS['knn'] = '#eb7d5b';

        that.COLORS['cnn'] = '#FD8D3C';
        that.COLORS['nn_10-layers'] = '#3182BD';
        that.COLORS['nn_5-layers'] = '#6BAED6';
        that.COLORS['nn_3-layers'] = '#9ECAE1';
        that.COLORS['slp'] = '#9E9AC8';
        that.COLORS['rfc_50'] = '#30A354';
        that.COLORS['rfc_25'] = '#74C476';
        that.COLORS['rfc_10'] = '#A0D99B';
    }

    color_mode_3();

    this.MODEL_COMBINATIONS = [
        '',

        '0', '1', '2', '3', '4',

        '01', '02', '03', '04',
        '12', '13', '14',
        '23', '24',
        '34',

        '012', '013', '014',
        '023', '024', '024',
        '034',
        '123', '124',
        '134',
        '234',

        '0123', '0124', '0134', '0234', '1234',

        '01234'
    ];
};
