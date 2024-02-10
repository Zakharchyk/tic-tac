"use strict"; 
const $ = el => document.querySelector(el); //задаем переменные
const $$ = ell => document.querySelectorAll(ell);
let curSign;
let ifWon = false;
let ifDidFirstStep = false;
let botStep = false;
let stepCount = 0;
let playerSign = "no";
let playS = "nothing";
let list = { //этот обьект будет отвечать за расположение знаков на поле(крестов и нулей)
    "f0": false,
    "f1": false,
    "f2": false,
    "f3": false,
    "f4": false,
    "f5": false,
    "f6": false,
    "f7": false,
    "f8": false,
};

function reload() { //эта функция отвечает за перезагрузку по кнопке внизу страницы(не работает если не сделан хотя бы один ход, ибо... ну зачем лишний раз перезагружаить страницу)
    if (!$(".butt").classList.contains("disableRes")) {
        location.reload();
    }
}
//следующая функция делает выбор кнопки и установку знака игрока, до первого хода игрок может изменить выбранный знак
$$('.choice').forEach(n => n.onclick = () => {
    if (n.classList.contains("blockbut")) {
        alert("Вы уже выбрали этот знак");
    } else {
        if (n.classList.contains("buttC")) {
            curSign = "z";
            n.classList.remove("but");
            n.classList.add("blockbut");
            $(".buttZ").classList.add("blockbut");
            if (!ifDidFirstStep) {
                $(".buttZ").classList.remove("blockbut");
                $(".buttZ").classList.add("but");
            }
        } else {
            curSign = "c";
            n.classList.remove("but");
            n.classList.add("blockbut");
            $(".buttC").classList.add("blockbut");
            if (!ifDidFirstStep) {
                $(".buttC").classList.remove("blockbut");
                $(".buttC").classList.add("but");
            }
        }
    }
})

//обработчик нажатий игроком на поле, от него исходят все дальнейшие функции
$$(".oneField").forEach(b => b.onclick = () => {
        if (!b.classList.contains("block") && curSign != undefined) {
            ifDidFirstStep = true; //переменная смотрит был ли сделан первый ход
            //первый ход всегда делает игрок
            if (ifDidFirstStep) {
                if (playerSign == "no") {
                    if (curSign == "z") {
                        playerSign = "zero"; // закрепляет знак игрока в переменную  и его уже нельзя будет поменять
                        //кстати, переменная curSign отвечает за текущий знак, который может ходить, ею пользуются и бот, и игрок
                        playS = "z";
                    } else if (curSign == "c") {
                        playerSign = "cross";
                        playS = "c";
                    }
                } //блокируем кнопки выбора знака
                $(".butt").classList.remove("disableRes");
                $(".butt").classList.add("enableRes");
                $(".buttC").classList.remove("but");
                $(".buttZ").classList.remove("but");
                $(".buttC").classList.add("blockbut");
                $(".buttZ").classList.add("blockbut");
            }
            setSign(curSign, b); //устанавливаем знак в выбранную клетку
            botStep = true; // теперь бот может сделать ход
            if (botStep) { // условный бот, может пользоваться внешними функциями
                if (stepCount < 9) {
                    let botSign;
                    let botSign2;
                    if (playerSign == "zero") {
                        botSign = "c"; // этакий костыль на котором держится проверка бота на возможную линию, которую делает он сам или игрок но об этом позже
                        botSign2 = "cross";
                    } else {
                        botSign = "z";
                        botSign2 = "zero";
                    }
                    // проверка может ли бот победить если сделает правильный ход, или же существует подобная угроза от игрока и в зависимости от этого поставить знак на подходящую клетку
                    let chanse = bigChechingOfLines(botSign2);
                    if (chanse != "n") {
                        let c = chanse.slice(1);
                        let tele = $$(".oneField")[c];
                        setSign(botSign, tele);
                    } else {
                        let danger = bigChechingOfLines(playerSign);
                        if (danger != "n") {
                            let a = danger.slice(1);
                            let mts = $$(".oneField")[a];
                            setSign(curSign, mts);
                        } else {
                            generateRandFieldForBot();
                        }
                    }
                }
            }
        }
    })
    // установка нужного знака и обновление статуса всех квадратов на поле(есть ли знак, какой знак) функцией (ListOfFields)
function setSign(curSigner, b) {
    if (!ifWon) {
        if (curSigner == "z") {
            b.classList.add("zero");
            // все знаки рисуются посредством добавления html-блоков(div) с определенными классами, при помощи которрых и создаются знаки, никаких картинок!
            b.innerHTML = "<div class='round'><div class='zeD'></div></div>";
            curSign = "c";
        } else if (curSigner == "c") {
            b.classList.add("cross");
            b.innerHTML = "<div class='crD'></div>";
            curSign = "z";
        }
        b.classList.add("block");
        stepCount++;
        ListOfFields();
        let chek = checkIfWon(curSigner); //проверка на победу игрока или бота
        if (chek != "noW") {
            ifWon = true;
            setTimeout(() => {
                if (chek == playS) {
                    alert("You have won!!!");
                } else {
                    alert("Computer has won!!!");
                }
            }, 10); // задержка нужна для избежания бага в Google Chrome, при  котором сообщение выводится раньше чем отрисовывается знак
        }
    }
}
//следующие 2 функции генерируют для бота новую клетку и проверяют пустая ли она, типо соревнования
function generateRandFieldForBot() {
    let el = $$(".oneField")[Math.floor(Math.random() * $$(".oneField").length)];
    checkAndSet(el);
}

function checkAndSet(elem) {
    if (elem.classList.contains("block")) {
        generateRandFieldForBot();
    } else {
        setSign(curSign, elem); //если клетка пустая то устанавливаем элемент
        botStep = false;
    }
}

function ListOfFields() { //техническая функция устанавливает в обьект значения полей, будет использоваться в следующей функции
    for (let i = 0; i <= 8; i++) {
        let curVar = "f" + i;
        let curF = $$(".oneField")[i];
        let curFSt;
        if (curF.classList.contains("zero")) {
            curFSt = "zero";
        } else if (curF.classList.contains("cross")) {
            curFSt = "cross";
        } else {
            curFSt = false;
        };
        list[curVar] = curFSt;
    }
}

//универсальная функция проверяет все клетки поля и возможные линии, на которых потенциально можно поставить знак и победить таким образом(кстати знак может быть любым)
function bigChechingOfLines(wh) {
    let answer;
    if (list["f0"] == list["f3"] && list["f0"] == wh && list["f3"] == wh && list["f3"] != false && list["f6"] == false) {
        answer = "f6";
    } else if (list["f0"] == list["f6"] && list["f0"] == wh && list["f6"] == wh && list["f6"] != false && list["f3"] == false) {
        answer = "f3";
    } else if (list["f3"] == list["f6"] && list["f3"] == wh && list["f6"] == wh && list["f6"] != false && list["f0"] == false) {
        answer = "f0";
    } else if (list["f1"] == list["f4"] && list["f1"] == wh && list["f4"] == wh && list["f4"] != false && list["f7"] == false) {
        answer = "f7";
    } else if (list["f1"] == list["f7"] && list["f1"] == wh && list["f7"] == wh && list["f7"] != false && list["f4"] == false) {
        answer = "f4";
    } else if (list["f4"] == list["f7"] && list["f4"] == wh && list["f7"] == wh && list["f7"] != false && list["f1"] == false) {
        answer = "f1";
    } else if (list["f2"] == list["f5"] && list["f2"] == wh && list["f5"] == wh && list["f5"] != false && list["f8"] == false) {
        answer = "f8";
    } else if (list["f2"] == list["f8"] && list["f2"] == wh && list["f8"] == wh && list["f8"] != false && list["f5"] == false) {
        answer = "f5";
    } else if (list["f5"] == list["f8"] && list["f5"] == wh && list["f8"] == wh && list["f8"] != false && list["f2"] == false) {
        answer = "f2";
    } else if (list["f0"] == list["f1"] && list["f0"] == wh && list["f1"] == wh && list["f1"] != false && list["f2"] == false) {
        answer = "f2";
    } else if (list["f0"] == list["f2"] && list["f0"] == wh && list["f2"] == wh && list["f2"] != false && list["f1"] == false) {
        answer = "f1";
    } else if (list["f1"] == list["f2"] && list["f1"] == wh && list["f2"] == wh && list["f2"] != false && list["f0"] == false) {
        answer = "f0";
    } else if (list["f3"] == list["f4"] && list["f3"] == wh && list["f4"] == wh && list["f4"] != false && list["f5"] == false) {
        answer = "f5";
    } else if (list["f3"] == list["f5"] && list["f3"] == wh && list["f5"] == wh && list["f5"] != false && list["f4"] == false) {
        answer = "f4";
    } else if (list["f4"] == list["f5"] && list["f4"] == wh && list["f5"] == wh && list["f5"] != false && list["f3"] == false) {
        answer = "f3";
    } else if (list["f6"] == list["f7"] && list["f6"] == wh && list["f7"] == wh && list["f7"] != false && list["f8"] == false) {
        answer = "f8";
    } else if (list["f6"] == list["f8"] && list["f6"] == wh && list["f8"] == wh && list["f8"] != false && list["f7"] == false) {
        answer = "f7";
    } else if (list["f7"] == list["f8"] && list["f7"] == wh && list["f8"] == wh && list["f8"] != false && list["f6"] == false) {
        answer = "f6";
    } else if (list["f0"] == list["f4"] && list["f0"] == wh && list["f4"] == wh && list["f4"] != false && list["f8"] == false) {
        answer = "f8";
    } else if (list["f0"] == list["f8"] && list["f0"] == wh && list["f8"] == wh && list["f8"] != false && list["f4"] == false) {
        answer = "f4";
    } else if (list["f4"] == list["f8"] && list["f4"] == wh && list["f8"] == wh && list["f8"] != false && list["f0"] == false) {
        answer = "f0";
    } else if (list["f2"] == list["f4"] && list["f2"] == wh && list["f4"] == wh && list["f4"] != false && list["f6"] == false) {
        answer = "f6";
    } else if (list["f6"] == list["f2"] && list["f6"] == wh && list["f2"] == wh && list["f6"] != false && list["f4"] == false) {
        answer = "f4";
    } else if (list["f4"] == list["f6"] && list["f4"] == wh && list["f6"] == wh && list["f6"] != false && list["f2"] == false) {
        answer = "f2";
    } else {
        answer = "n";
    }
    return answer;
}

function checkIfWon(ws) { //похожая функция проверяет есть ли линия из знаков на поле и возвращает знак победителя(бота или игрока - неважно)
    let e;
    if (list["f0"] == list["f1"] && list["f1"] == list["f2"] && list["f2"] == list["f0"] && list["f0"] != false) {
        e = true;
    } else if (list["f3"] == list["f4"] && list["f4"] == list["f5"] && list["f5"] == list["f3"] && list["f3"] != false) {
        e = true;
    } else if (list["f6"] == list["f7"] && list["f7"] == list["f8"] && list["f6"] == list["f8"] && list["f6"] != false) {
        e = true;
    } else if (list["f0"] == list["f3"] && list["f3"] == list["f6"] && list["f6"] == list["f0"] && list["f0"] != false) {
        e = true;
    } else if (list["f4"] == list["f1"] && list["f1"] == list["f7"] && list["f7"] == list["f4"] && list["f1"] != false) {
        e = true;
    } else if (list["f8"] == list["f5"] && list["f5"] == list["f2"] && list["f2"] == list["f8"] && list["f2"] != false) {
        e = true;
    } else if (list["f0"] == list["f4"] && list["f8"] == list["f4"] && list["f8"] == list["f0"] && list["f0"] != false) {
        e = true;
    } else if (list["f2"] == list["f4"] && list["f4"] == list["f6"] && list["f2"] == list["f6"] && list["f2"] != false) {
        e = true;
    } else {
        e = false;
    }
    if (e == true) {
        if (ws == "c") {
            return "c";
        } else {
            return "z";
        }
    } else {
        return "noW";
    }
}