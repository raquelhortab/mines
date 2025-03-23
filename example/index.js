import mines from 'mines';

var m = mines.create({
    // preset: 'expert',
    dimensions: [9, 9],
    mine_count: 1,
    mines: [[0, 0]],
    initialState: [
        [
            '⬜', '1️⃣', '0️⃣',
            '⬜', '⬜', '⬜',
            '⬜', '⬜', '⬜'
        ],
        [
            '⬜', '⬜', '⬜',
            '⬜', '⬜', '⬜',
            '⬜', '⬜', '⬜'
        ],
        [
            '⬜', '⬜', '⬜',
            '⬜', '⬜', '⬜',
            '⬜', '⬜', '⬜'
        ],
        [
            '⬜', '⬜', '⬜',
            '⬜', '⬜', '⬜',
            '⬜', '⬜', '⬜'
        ],
        [
            '⬜', '⬜', '⬜',
            '⬜', '⬜', '⬜',
            '⬜', '⬜', '⬜'
        ],
        [
            '⬜', '⬜', '⬜',
            '⬜', '⬜', '⬜',
            '⬜', '⬜', '⬜'
        ],
        [
            '⬜', '⬜', '⬜',
            '⬜', '⬜', '⬜',
            '⬜', '⬜', '⬜'
        ],
        [
            '⬜', '⬜', '⬜',
            '⬜', '⬜', '⬜',
            '⬜', '⬜', '⬜'
        ],
        [
            '⬜', '⬜', '⬜',
            '⬜', '⬜', '⬜',
            '⬜', '⬜', '⬜'
        ]
    ]

});
// m.onGameStateChange(
//     function (state, oldState) {
//         console.log('game changed', oldState, state);
//         console.log(m.renderAsString());
//     }
// );
// m.onCellStateChange(
//     function (cell, state, oldState) { console.log('cell', cell, 'changed from', oldState, 'to', state); }
// );
// m.reveal([4, 4]);
// m.reveal([2, 10]);
// m.mark([5, 12]);

console.log(m.visibleField().state());