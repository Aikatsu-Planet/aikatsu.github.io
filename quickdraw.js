/*

縦置きのみでの使用を前提とする。

*/

// 未使用
let orientationAngle = screen.orientation.angle;

// キャンバス
let canvas;

// ボタンの辞書
let buttons;

let pen = {
    isEraser: false,
    width: 4,
    color: "black",
};

let ongoingTouches = [];

// 描画履歴
let canvasUndoHistory = [];
// リドゥ (やり直し) の履歴
let canvasRedoHistory = [];

// 保持する履歴の最大数
const canvasHistoryLimit = 20;


function doCanvas() {
    // キャンバスを操作する前に実行すると、
    // その時点での状態が記録される

    let context = canvas.getContext("2d");

    let image = context.getImageData(0, 0, canvas.width, canvas.height);
    canvasUndoHistory.push(image);

    if (canvasUndoHistory.length > canvasHistoryLimit) {
        canvasUndoHistory.shift();
    }
    canvasRedoHistory = [];

    updateButtonState()
}
function undoCanvas(params) {
    // 元に戻す
    let context = canvas.getContext("2d");

    let image = context.getImageData(0, 0, canvas.width, canvas.height);
    canvasRedoHistory.push(image);

    image = canvasUndoHistory.pop();
    context.putImageData(image, 0, 0);

    updateButtonState()
}
function redoCanvas(params) {
    // やり直し
    let context = canvas.getContext("2d");

    let image = context.getImageData(0, 0, canvas.width, canvas.height);

    canvasUndoHistory.push(image);
    if (canvasUndoHistory.length > canvasHistoryLimit) {
        canvasUndoHistory.shift();
    }

    image = canvasRedoHistory.pop();
    context.putImageData(image, 0, 0);

    updateButtonState()
}


function ongoingTouchIndexById(idToFind) {
    // タッチしている指のインデックス番号を取得

    for (var i = 0; i < ongoingTouches.length; i++) {
        var id = ongoingTouches[i].identifier;

        if (id == idToFind) {
          return i;
        }
    }
    return -1;    // not found
}

function updateButtonState() {
    // ボタンの有効無効を更新
    if (canvasUndoHistory.length == 0) {
        buttons.main.undo.setAttribute("disabled", "");
    } else {
        buttons.main.undo.removeAttribute("disabled");
    }

    if (canvasRedoHistory.length == 0) {
        buttons.main.redo.setAttribute("disabled", "");
    } else {
        buttons.main.redo.removeAttribute("disabled");
    }

}

function initButton() {
    buttons.main.undo.addEventListener("click", btnUndo);
    buttons.main.redo.addEventListener("click", btnRedo);
    buttons.main.clear.addEventListener("click", btnClear);
    buttons.main.rotate.addEventListener("click", btnRotate);
    buttons.main.pen.addEventListener("click", btnPen);

    buttons.pen.eraser.addEventListener("click", btnSetEraser);
    buttons.pen.normal.addEventListener("click", btnSetNormalPen);
    buttons.pen.red.addEventListener("click", btnSetRedPen)
    buttons.pen.blue.addEventListener("click", btnSetBluePen)

}
function changeInterface(id) {
    let interfaceChildrens = document.getElementById("interface").children;
    for (let i = 0; i < interfaceChildrens.length; i++) {
        interfaceChildrens[i].style.display = "none";
    }
    document.getElementById("interface-" + id).style.display = "block";

}

// ボタン処理
function btnUndo() {
    undoCanvas()
}

function btnRedo() {
    redoCanvas()
}
function btnClear() {
    doCanvas();
    let context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

}
function btnRotate() {

    let image = new Image(canvas.width, canvas.height);
    image.src = canvas.toDataURL();
    image.onload = () => {



        context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.save();
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(Math.PI); // 180度
        context.drawImage(image, -canvas.width / 2, -canvas.height / 2);

        context.restore();
    };

}
function btnPen() {
    changeInterface("pen");
}


function btnSetEraser() {
    pen.isEraser = true;
    pen.width = 16;
    pen.color = "black";

}

function btnSetNormalPen() {
    pen.isEraser = false;
    pen.width = 4;
    pen.color = "black";
}

function btnSetRedPen() {
    pen.isEraser = false;
    pen.width = 4;
    pen.color = "red";
}

function btnSetBluePen() {
    pen.isEraser = false;
    pen.width = 4;
    pen.color = "blue";
}

function drawPenDown(x, y) {
    let context = canvas.getContext("2d");

    if (pen.isEraser) {
        context.globalCompositeOperation = "destination-out";
    } else {
        context.globalCompositeOperation = "source-over";
    }

    context.beginPath();
    context.arc(
        x, y,
        pen.width / 2,
        0, 2 * Math.PI,
        false
    );
    context.fillStyle = pen.color;
    context.fill();

}
function drawPenUp(x, y) {
    // let context = canvas.getContext("2d");

}
function drawPenMove(x1, y1, x2, y2) {
    let context = canvas.getContext("2d");

    if (pen.isEraser) {
        context.globalCompositeOperation = "destination-out";
    } else {
        context.globalCompositeOperation = "source-over";
    }

    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);

    context.lineWidth = pen.width;
    context.strokeStyle = pen.color;

    context.stroke();

    // 終点に円を描画
    context.beginPath();
    context.arc(
        x2, y2,
        pen.width / 2,
        0, 2 * Math.PI,
        false
    );

    context.fillStyle = pen.color;
    context.fill();

}
// タッチイベントハンドラ
function touchStart(e) {
    e.preventDefault();

    doCanvas();
    //if (orientationAngle != screen.orientation.angle) {
    //    orientationChange();
    //}

    let touches = e.changedTouches;


    for (let i = 0; i < touches.length; i++) {
        // 指一つひとつの処理を行う
        let touch = {
            identifier: touches[i].identifier,
            pageX: touches[i].pageX,
            pageY: touches[i].pageY,
        };
        let point =  [
            touch.pageX,
            touch.pageY,
        ];

        ongoingTouches.push(touch);

        drawPenDown(point[0], point[1]);
    }
}
function touchEnd(e) {
    e.preventDefault();

    let touches = e.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        // 指一つひとつの処理を行う
        let touch = {
            identifier: touches[i].identifier,
            pageX: touches[i].pageX,
            pageY: touches[i].pageY,
        };

        let finger = ongoingTouchIndexById(touch.identifier);

        let touchPrev = {
            identifier: ongoingTouches[finger].identifier,
            pageX: ongoingTouches[finger].pageX,
            pageY: ongoingTouches[finger].pageY,
        };

        let point =  [
            touch.pageX,
            touch.pageY,
        ];
        let pointPrev = [
            touchPrev.pageX,
            touchPrev.pageY,
        ];



        if (finger >= 0) {
            drawPenUp(point[0], point[1]);

            ongoingTouches.splice(finger, 1);
        }

    }


}
function touchCancel(e) {
    e.preventDefault();

    let touches = e.changedTouches();

    for (let i = 0; i < touches.length; i++) {
        let finger = ongoingTouchIndexById(touches[i].identifier);
        ongoingTouches.splice(finger, 1);
    }
}
function touchMove(e) {
    e.preventDefault();

    let touches = e.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        // 指一つひとつの処理を行う
        let touch = {
            identifier: touches[i].identifier,
            pageX: touches[i].pageX,
            pageY: touches[i].pageY,
        };

        let finger = ongoingTouchIndexById(touch.identifier);

        let touchPrev = {
            identifier: ongoingTouches[finger].identifier,
            pageX: ongoingTouches[finger].pageX,
            pageY: ongoingTouches[finger].pageY,
        };

        let point =  [
            touch.pageX,
            touch.pageY,
        ];
        let pointPrev = [
            touchPrev.pageX,
            touchPrev.pageY,
        ];

        if (finger >= 0) {
            drawPenMove(pointPrev[0], pointPrev[1], point[0], point[1]);

            ongoingTouches.splice(finger, 1, touch);
        } else {
            //
        }

    }

}

function initCanvasSize() {
    // canvasのサイズを初期化
    let wrapper = document.getElementById("canvas-wrapper");

    canvas.setAttribute("width", wrapper.clientWidth);
    canvas.setAttribute("height", wrapper.clientHeight);
}

function setCanvasSize(width, height) {
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);

}

function initTouchEvent(params) {
    // タッチイベント処理を初期化

    canvas.addEventListener("touchstart", touchStart, false);
    canvas.addEventListener("touchend", touchEnd, false);
    canvas.addEventListener("touchcancel", touchCancel, false);
    canvas.addEventListener("touchmove", touchMove, false);
}

document.addEventListener("DOMContentLoaded", () => {
    //Screen.lockOrientation("landscape");
    canvas = document.getElementById("canvas");

    initCanvasSize();

    initTouchEvent();

    buttons = {
        main: {
            undo: document.getElementById("btn-main-undo"),
            redo: document.getElementById("btn-main-redo"),
            clear: document.getElementById("btn-main-clear"),
            rotate: document.getElementById("btn-main-rotate"),
            pen: document.getElementById("btn-main-pen"),
            save: document.getElementById("btn-main-save"),
            load: document.getElementById("btn-main-load"),
        },
        pen: {
            eraser: document.getElementById("btn-pen-eraser"),
            normal: document.getElementById("btn-pen-normal"),
            red: document.getElementById("btn-pen-red"),
            blue: document.getElementById("btn-pen-blue"),
        }

    };
    let backButtons = document.getElementsByClassName("btn-back");
    for (let i = 0; i < backButtons.length; i++) {
        backButtons[i].addEventListener("click", () => {
            changeInterface("main");
        });
    }
    changeInterface("main");


    initButton();
    updateButtonState();
});





// 未使用
function orientationChange() {
    let context = canvas.getContext("2d");



    let image = new Image(canvas.width, canvas.height);
    image.src = canvas.toDataURL();
    image.onload = () => {

        let documentSize = [document.body.clientWidth, document.body.clientHeight];
        let canvasSize;
        if (screen.orientation.angle == 0 || screen.orientation.angle == 180) {
            // 縦
            canvasSize = [Math.min(...documentSize), Math.max(...documentSize) * 0.9];
        } else {
            // 横
            canvasSize = [Math.max(...documentSize), Math.min(...documentSize) * 0.9];
        }
        setCanvasSize(canvasSize[0], canvasSize[1]);


        context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        console.log((orientationAngle - screen.orientation.angle))
        context.save();
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate((orientationAngle - screen.orientation.angle) * Math.PI / 180);
        context.drawImage(image, -canvas.height / 2, -canvas.width / 2);
        context.rotate(-(orientationAngle - screen.orientation.angle) * Math.PI / 180);
        context.translate(-canvas.width / 2, -canvas.height / 2);

        console.log(orientationAngle - screen.orientation.angle);
        context.restore();
        orientationAngle = screen.orientation.angle;
    };






}

// window.addEventListener("orientationchange", orientationChange);
try {
    Screen.lockOrientation('landscape');
} catch (error) {
    console.log("画面の固定は利用できません。");
}
