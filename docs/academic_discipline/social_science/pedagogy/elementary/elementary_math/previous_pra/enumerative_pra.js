window.onload = function() {
    document.getElementById('generateCircles').addEventListener('click', function() {
        const a = document.getElementById('circleCount').value;
        if (a > 0 && a <= 10) {
            generateCircles(); // 入力が条件に合う場合のみ円を生成
        } else {
            alert('1から10の間で入力してください');
            document.getElementById('circleCount').value = a.replace(/[^0-9]/g, '').slice(0, 2);
            return; // 入力が条件に合わない場合は処理を中断
        }
    });
}

const circlesContainer = document.getElementById('circles-container');
const box = document.getElementById('box');
const countDisplay = document.getElementById('count');
let count = 0; // 箱の中の円の数を追跡するカウンタ

// 円の幅と高さ（固定サイズ）
const circleSize = 50; // ピクセル単位
const margin = 10; // 各円の間隔

// 動的に円を生成する関数
function generateCircles() {
    const circleCount = parseInt(document.getElementById('circleCount').value);

    // 既存の円を削除
    removeAllCircles();

    // 円を指定された数だけ生成
    for (let i = 1; i <= circleCount; i++) {
        const circle = document.createElement('div');
        circle.classList.add('circle');
        circle.setAttribute('draggable', 'true');
        circle.setAttribute('id', `circle${i}`); // 一応ユニークなIDも設定

        // イベントリスナーを追加
        circle.addEventListener('dragstart', dragStart);
        circle.addEventListener('dragend', dragEnd); // dragendを再度追加

        // 円をコンテナに追加
        circlesContainer.appendChild(circle);
    }
}

// 箱とコンテナ内の全ての円を削除する関数
function removeAllCircles() {
    // 箱の中の円をすべて削除
    while (box.firstChild) {
        box.removeChild(box.firstChild);
    }

    // コンテナ内の円をすべて削除
    circlesContainer.innerHTML = '';
    
    // カウンタもリセット
    count = 0;
    updateCount(0);
}

// ドラッグスタートの処理
function dragStart(event) {
    event.dataTransfer.setData('circleId', event.target.id); // ドラッグしている円のIDを保存
}

// ドロップゾーン（箱）に対してドラッグオーバーとドロップのイベントリスナーを設定
box.addEventListener('dragover', dragOver);
box.addEventListener('drop', drop);

// ドラッグオーバーの処理（ドロップを許可するために必要）
function dragOver(event) {
    event.preventDefault();
}

// ドロップの処理
function drop(event) {
    event.preventDefault();
    
    // ドラッグされた円のIDを取得
    const circleId = event.dataTransfer.getData('circleId');
    const draggedCircle = document.getElementById(circleId); // IDから要素を取得

    if (draggedCircle) {
        // ドロップされた円が既に箱に含まれている場合は削除する
        if (box.contains(draggedCircle)) {
            box.removeChild(draggedCircle); // 箱から円を削除
            updateCount(-1); // カウンタを減少
        } 
        // ドロップされた円が箱に含まれていない場合のみ追加
        else {
            box.appendChild(draggedCircle);
            draggedCircle.classList.add('circle-inside-box');
            positionCircleInGrid(draggedCircle);
            updateCount(1); // カウンタを増加
        }
    } else {
        console.error('円が見つかりません:', circleId);
    }
}

// ドラッグ終了時の処理
function dragEnd(event) {
    const circle = event.target;
    const mouseX = event.pageX;
    const mouseY = event.pageY;
    const boxRect = box.getBoundingClientRect();

    // ドラッグ終了位置が箱の範囲外かどうかを判定
    if (
        mouseX < boxRect.left || mouseX > boxRect.right || 
        mouseY < boxRect.top || mouseY > boxRect.bottom
    ) {
        console.log('箱の外に出ました:', circle);
        if (box.contains(circle)) {
            box.removeChild(circle); // 箱から円を削除
            updateCount(-1); // カウンタを減少
        }
    }
}

// ページ全体にドロップゾーンを追加
document.addEventListener('dragover', (event) => {
    event.preventDefault();
});

// ページ全体でのドロップ処理
document.addEventListener('drop', (event) => {
    event.preventDefault();

    const circleId = event.dataTransfer.getData('circleId');
    const draggedCircle = document.getElementById(circleId);

    // ドロップされた円が箱の外にドロップされたら削除
    if (draggedCircle && !box.contains(draggedCircle)) {
        console.log('ページ全体でのドロップ検知:', draggedCircle);
        if (box.contains(draggedCircle)) {
            box.removeChild(draggedCircle); // 箱から円を削除
            updateCount(-1); // カウンタを減少
        }
    }
});

// カウンタを更新する関数
function updateCount(change) {
    count += change;
    countDisplay.innerText = count; // カウンタを画面に反映
}

// ドロップされた円を箱の中に整列配置する関数
function positionCircleInGrid(circle) {
    const boxRect = box.getBoundingClientRect();
    const circlesPerRow = Math.floor(boxRect.width / (circleSize + margin));
    const row = Math.floor(count / circlesPerRow);
    const col = count % circlesPerRow;
    const xPos = col * (circleSize + margin);
    const yPos = row * (circleSize + margin);

    circle.style.position = 'absolute';
    circle.style.left = `${xPos}px`;
    circle.style.top = `${yPos}px`;
}
