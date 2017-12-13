// get the modal 
let modal = document.getElementById('modal-window');
let modalImg = document.getElementById("img-mod");
// get counter and counterText
let counter = 0;
let counterText = document.getElementById("saveCounter");
// get all kinds of buttons
let details = document.getElementsByClassName('details');
let likes = document.getElementsByClassName('likes');
let saves = document.getElementsByClassName("saves");
//iterate through them and add event to each of the button you have the same number of buttons you get for every picture 3
for (i = 0; i < details.length; i++) {
	details[i].addEventListener("click", showModal, false);
    likes[i].addEventListener("click", toggleLike, false);
    saves[i].addEventListener("click", toggleSaves, false);
}

function showModal( eo)  {
   modal.style.display = "block";
// traverse the dom tree and display image
   modalImg.src = eo.currentTarget.parentNode.parentNode.children.item(1).src;
}

// get the <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];
span.onclick = function() { 
	modal.style.display = "none";
}

// Display Like button
function toggleLike(eo) {
	let caller = eo.currentTarget.parentNode.parentNode.children[0].children[0];
	if (caller.className === "heart showOff") {
		caller.setAttribute("class", "heart showOn");
	} else {
		caller.setAttribute("class", "heart showOff");
	}
}

// transform button and image what you save and count the counter
function toggleSaves(eo){
	let currentSave = (eo.currentTarget);
	let image = currentSave.parentNode.parentNode.children[1];
	console.log(image);
	if(currentSave.className == "saves buttons"){
		counter++;
		currentSave.setAttribute("class", "saved buttons");
		image.setAttribute("class", "saved-img");
	}else{
	    counter--;
	    currentSave.setAttribute("class", "saves buttons");
	    image.setAttribute("class", "");
    }
    counterText.innerHTML = "Saved photos: " + counter;
}