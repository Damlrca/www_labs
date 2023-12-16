// Для заданного словаря использованы слова из текста задачи
let myDictionary = ['Когда', 'Создайте', 'автозавершения', 'вариантов', 'варианту', 'вас', 'вводе', 'вводимого', 'возможных', 'есть', 'заданный', 'из', 'которые', 'который', 'массив', 'меняет', 'на', 'начинаются', 'него', 'них', 'нужно', 'он', 'отображает', 'по', 'под', 'показывать', 'поле', 'полем', 'пользователь', 'поля', 'предложенному', 'при', 'программы', 'скрипт', 'содержащую', 'содержимое', 'список', 'страницу', 'те', 'текста', 'тексте', 'текстовое', 'текстовым', 'щёлкает']

function setText(val) {
	let textArea = document.getElementById("myTextarea");
	textArea.value = val;
}

function addButton(val) {
	let myDiv = document.getElementById("myDiv");
	let newButton = document.createElement("input");
	newButton.type = "button";
	newButton.value = val;
	newButton.onclick = function() {
		setText(this.value);
		updateText();
	};
	myDiv.appendChild(newButton);
}

function updateText() {
	let txt = document.getElementById("myTextarea").value;
	let myDiv = document.getElementById("myDiv");
	while (myDiv.firstChild) {
		myDiv.removeChild(myDiv.lastChild);
	}
	if (txt.length == 0) {
		return;
	}
	for (let i in myDictionary) {
		if (myDictionary[i].startsWith(txt)) {
			addButton(myDictionary[i]);
		}
	}
}
