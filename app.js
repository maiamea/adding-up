'use strict';
// 「2010 年から 2015 年にかけて 15〜19 歳の人が増えた割合の都道府県ランキング」

// 1. ファイルからデータを読み取る

// ファイルシステムモジュール (ファイル操作するAPI) を読み込む
const fs = require('fs');
// readlineモジュール (一行ずつ読み込むAPI) を読み込む
const readline = require('readline');
// popu-pref.csvファイルから、ファイルの読み込みを随時行うStreamを作成
const rs = fs.createReadStream('./popu-pref.csv');
// 作成した Streamを readline オブジェクトの input として設定し、 rl オブジェクトを作成
const rl = readline.createInterface({ 'input': rs, 'output': {} });
// key: 都道府県名　value: 集計データオブジェクト をもつ連想配列を作成　（都道府県ごとの集計データ）
const prefectureDataMap = new Map();

// 2. ファイルからデータを抜き出す

// 1行読み込むイベントを感知するごとに以下の処理を行う。無名関数、引数:lineString
rl.on('line', (lineString) => {
    // コンソールにlineStringの内容を出力
    // console.log(lineString)
    // lineString文字列をカンマで区切ったcolumns配列を作成
    const columns = lineString.split(','); 
    // 集計年(0番目のカラム)の文字列を整数値に変換
    const year = parseInt(columns[0]);
    // 都道府県名(1番目のカラム)
    const prefecture = columns[1];
    // 2010年と2015年の15〜19 歳の人口(3番目のカラム)の文字列を整数値に変換
    const popu = parseInt(columns[3]);

    // 2010年と2015年の都道府県の15〜19 歳の人口を表示
    // if (year === 2010 || year === 2015) {
    //     console.log(year);
    //     console.log(prefecture);
    //     console.log(popu);       
    // }

    if (year === 2010 || year === 2015) {
        // 連想配列から都道府県情報を取得し value オブジェクトに代入 
        // (同じ県名のデータが来れば、前回保存した value オブジェクトが取得される)
        let value = prefectureDataMap.get(prefecture);
        // value がなかった場合、以下3つを初期値とした value オブジェクトを代入
        if (!value) {
            value = {
                // 2010年の人口を表すプロパティ
                popu10: 0,
                // 2015年の人口を表すプロパティ
                popu15: 0,
                // 人口の変化率を表すプロパティ
                change: null
            };
        }
        // year が 2010の場合、15〜19 歳の人口データを 連想配列の value オブジェクトの popu10 プロパティ に代入
       if (year === 2010) {
        value.popu10 = popu;
    }   
        // year が 2015の場合、15〜19 歳の人口データを 連想配列の value オブジェクトの popu15 プロパティ に代入
        if (year === 2015) {
            value.popu15 = popu;
        }
        // 都道府県情報と、人口データを連想配列に保存
        prefectureDataMap.set(prefecture, value);
    }
});

// 全ての行を読み込み終えたイベントを感知したら、以下の処理を行う
rl.on('close', () => {

    // 連想配列を出力 
    // (各都道府県の名前をキーにして、集計データのオブジェクトが入っている データ構造が表示される)
    // console.log(prefectureDataMap);

    // 3. 変化率の計算
    // for-of 構文
    // Map や Array の中身を of の前に与えられた変数に代入して 
    // for ループと同じことができる (配列に含まれる要素を使いたいだけで、添字は不要な場合に便利)
    //  Map に for-of を使うと、キーと値で要素が 2 つある prefectureDataMap 配列が
    // 前に与えられた key, value変数に代入されます
    for (let [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
    }

    // 4. データの並び替え
    // 連想配列を普通の配列に変換。
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        // return 0 → 順番はそのまま, return + → 大きい順, return - → 小さい順
        return pair2[1].change - pair1[1].change;
    });
    
    // 変化率の降順に並び替えた rankingArray 配列を出力
    // console.log(rankingArray);

    // Map の キーと値が要素になった rankingArray 配列を
    // 要素 [key, value] として受け取り、それを文字列に変換する
    const rankingStrings = rankingArray.map(([key, value]) => {
        return `${key} : ${value.popu10} => ${value.popu15} 変化率: ${value.change}`;
        // return key + ': ' + value.popu10 + ' => ' + value.popu15 + ' 変化率: ' + value.change;
    });
    console.log(rankingStrings);
});


// < sort関数の具体例 >
// const map = new Map();
// map.set('key1', { change: 0.5});
// >> Map { 'key1' => { change: 0.5 } }

// map.set('key2', { change: 0.3});
// >> Map { 'key1' => { change: 0.5 }, 'key2' => { change: 0.3 } }

// map.set('key3', { change: 0.6});
// >> Map {
//   'key1' => { change: 0.5 },
//   'key2' => { change: 0.3 },
//   'key3' => { change: 0.6 } }

// Array.from(map);
// >> [ [ 'key1', { change: 0.5 } ],
//   [ 'key2', { change: 0.3 } ],
//   [ 'key3', { change: 0.6 } ] ]

// Array.from(map)[0]
// >> [ 'key1', { change: 0.5 } ]

// Array.from(map)[0][1]
// >> { change: 0.5 }

// Array.from(map).sort((a, b) => b[1].change - a[1].change)
// >> [ [ 'key3', { change: 0.6 } ],
//   [ 'key1', { change: 0.5 } ],
//   [ 'key2', { change: 0.3 } ] ]

// map
// >> Map {
//   'key1' => { change: 0.5 },
//   'key2' => { change: 0.3 },
//   'key3' => { change: 0.6 } }

// Array.from(map).sort((a, b) => a[1].change - b[1].change)
// >> [ [ 'key2', { change: 0.3 } ],
//   [ 'key1', { change: 0.5 } ],
//   [ 'key3', { change: 0.6 } ] ]

// Array.from(map).sort((a, b) => {console.log('比較:', a, b); return a[1].change - b[1].change})
// >> 比較: [ 'key1', { change: 0.5 } ] [ 'key2', { change: 0.3 } ]
// 比較: [ 'key1', { change: 0.5 } ] [ 'key3', { change: 0.6 } ]
// [ [ 'key2', { change: 0.3 } ],
//   [ 'key1', { change: 0.5 } ],
//   [ 'key3', { change: 0.6 } ] ]