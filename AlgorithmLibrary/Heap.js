
// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


function Heap(am)
{
	this.init(am);

}

Heap.prototype = new Algorithm();
Heap.prototype.constructor = Heap;
Heap.superclass = Algorithm.prototype;



var ARRAY_SIZE  = 32;
var ARRAY_ELEM_WIDTH = 30;
var ARRAY_ELEM_HEIGHT = 25;
var ARRAY_INITIAL_X = 30;

var ARRAY_Y_POS = 50;
var ARRAY_LABEL_Y_POS = 70;


Heap.prototype.init = function(am)
{
	var sc = Heap.superclass;
	var fn = sc.init;
	fn.call(this,am);
	this.addControls();
	this.nextIndex = 0;
	this.HeapXPositions = [0, 450, 250, 650, 150, 350, 550, 750, 100, 200, 300, 400, 500, 600,
					  700, 800, 075, 125, 175, 225, 275, 325, 375, 425, 475, 525, 575, 
					  625, 675, 725, 775, 825];
	this.HeapYPositions = [0, 100, 170, 170, 240, 240, 240, 240, 310, 310, 310, 310, 310, 310,
					  310, 310, 380, 380, 380, 380, 380, 380, 380, 380, 380, 380, 380, 
					  380, 380, 380, 380, 380];
	this.commands = [];
	this.createArray();  


	
	/*this.nextIndex = 0;
	this.this.commands = [];
	this.cmd("CreateLabel", 0, "", 20, 50, 0);
	this.animationManager.StartNewAnimation(this.this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory(); */
	
}

Heap.prototype.addControls =  function()
{
// Insert field setup for accepting float values up to 2 decimal places
this.insertField = addControlToAlgorithmBar("Text", ""); 
this.insertField.size = 5; // Max display size corresponds to 5 characters

// Handle keydown event to enforce float input with up to two decimal places
this.insertField.onkeydown = (event) => {
    const key = event.key;
    let currentValue = this.insertField.value;
    console.log(`Key pressed: "${key}"`);
    console.log(`Current value in field: "${currentValue}"`);

    // Allow only digits, a single decimal point, backspace, delete, and arrow keys
    if (!/^[0-9.]$/.test(key) && key !== "Backspace" && key !== "Delete" && key !== "ArrowLeft" && key !== "ArrowRight") {
        console.log("Invalid key pressed. Only digits, a single decimal point, and control keys are allowed.");
        event.preventDefault(); // Block invalid input
        return;
    }

    // Prevent multiple decimal points
    if (key === "." && currentValue.includes(".")) {
        console.log("Decimal point already exists. Preventing additional decimal point.");
        event.preventDefault();
        return;
    }

    // Restrict input to two decimal places if a decimal point is present
    const decimalIndex = currentValue.indexOf(".");
    if (decimalIndex !== -1 && currentValue.slice(decimalIndex + 1).length >= 2 && key !== "Backspace" && key !== "Delete") {
        console.log("Two decimal places already entered. Blocking further input.");
        event.preventDefault();
        return;
    }

    // Prevent leading zero unless followed by a decimal point
    if (currentValue === "0" && key !== "." && key !== "Backspace" && key !== "Delete") {
        console.log("Leading zero is not allowed unless followed by a decimal point.");
        event.preventDefault();
        return;
    }

    // Enforce a maximum length of 5 characters for the entire input
    if (currentValue.length >= 5 && key !== "Backspace" && key !== "Delete" && key !== "ArrowLeft" && key !== "ArrowRight") {
        console.log("Maximum input length of 5 characters reached. Blocking further input.");
        event.preventDefault();
    }
};

// Insert button setup
this.insertButton = addControlToAlgorithmBar("Button", "Insert");
this.insertButton.onclick = this.insertCallback.bind(this);
console.log("Insert field and button initialized for float input up to 2 decimal places and max length 5.");



this.removeSmallestButton = addControlToAlgorithmBar("Button", "Delete Min");
this.removeSmallestButton.onclick = this.removeSmallestCallback.bind(this);

// Delete field setup for accepting float values up to 2 decimal places with max length 5
this.deleteField = addControlToAlgorithmBar("Text", ""); 
this.deleteField.size = 5; // Adjust the input field display size

// Handle keydown event to enforce float input with up to two decimal places and max length of 5
this.deleteField.onkeydown = (event) => {
    const key = event.key;
    let currentValue = this.deleteField.value;
    console.log(`Key pressed: "${key}"`);
    console.log(`Current value in field: "${currentValue}"`);

    // Allow only digits, a single decimal point, backspace, delete, and arrow keys
    if (!/^[0-9.]$/.test(key) && key !== "Backspace" && key !== "Delete" && key !== "ArrowLeft" && key !== "ArrowRight") {
        console.log("Invalid key pressed. Only digits, a single decimal point, and control keys are allowed.");
        event.preventDefault(); // Block invalid input
        return;
    }

    // Prevent multiple decimal points
    if (key === "." && currentValue.includes(".")) {
        console.log("Decimal point already exists. Preventing additional decimal point.");
        event.preventDefault();
        return;
    }

    // Prevent decimal point at the end of the value
    if (key === "." && currentValue.endsWith(".")) {
        console.log("Decimal point at the end is not allowed.");
        event.preventDefault();
        return;
    }

    // Restrict input to two decimal places if a decimal point is present
    const decimalIndex = currentValue.indexOf(".");
    if (decimalIndex !== -1 && currentValue.slice(decimalIndex + 1).length >= 2 && key !== "Backspace" && key !== "Delete") {
        console.log("Two decimal places already entered. Blocking further input.");
        event.preventDefault();
        return;
    }

    // Enforce a maximum length of 5 characters (including decimal point and digits)
    if (currentValue.length >= 5 && key !== "Backspace" && key !== "Delete" && key !== "ArrowLeft" && key !== "ArrowRight") {
        console.log("Maximum input length of 5 characters reached. Blocking further input.");
        event.preventDefault();
    }

    // Prevent leading zero unless followed by a decimal point
    if (currentValue === "0" && key !== "." && key !== "Backspace" && key !== "Delete") {
        console.log("Leading zero is not allowed unless followed by a decimal point.");
        event.preventDefault();
        return;
    }
};

// Delete button setup
this.deleteButton = addControlToAlgorithmBar("Button", "Delete");
this.deleteButton.onclick = this.deleteCallback.bind(this);
console.log("Delete field and button initialized for float input up to 2 decimal places and max length 5.");


	this.clearHeapButton = addControlToAlgorithmBar("Button", "Clear Heap");
	this.clearHeapButton.onclick = this.clearCallback.bind(this);

	this.buildHeapButton = addControlToAlgorithmBar("Button", "BuildHeap");
	this.buildHeapButton.onclick = this.buildHeapCallback.bind(this);

	this.randomizeField = addControlToAlgorithmBar("Text", ""); // Input for size
	this.randomizeField.onkeydown = this.returnSubmit(this.randomizeField, this.randomizeCallback.bind(this), 4, true); 
    this.randomizeButton = addControlToAlgorithmBar("Button", "Randomize");
    this.randomizeButton.onclick = this.randomizeCallback.bind(this);

}

Heap.prototype.randomizeCallback = function(event) {
    const size = parseInt(this.randomizeField.value);

    // Ensure size is valid and within allowed limits
    if (isNaN(size) || size <= 0 || size > 32) {  
        alert("Please enter a positive integer within a reasonable range(<=32).");
        return;
    }

	this.randomizeField.value = "";
	ARRAY_SIZE = size;
    this.createArray();

	this.buildHeapCallback(event);
};


Heap.prototype.createArray = function() {

    this.animationManager.resetAll();
    this.commands = new Array();

    // Initialize arrays and properties for the new array size
    this.arrayData = new Array(ARRAY_SIZE);
    this.arrayLabels = new Array(ARRAY_SIZE);
    this.arrayRects = new Array(ARRAY_SIZE);
    this.circleObjs = new Array(ARRAY_SIZE);
    this.ArrayXPositions = new Array(ARRAY_SIZE);
    this.currentHeapSize = 0;


    for (let i = 0; i < ARRAY_SIZE; i++) {
        this.ArrayXPositions[i] = ARRAY_INITIAL_X + i * ARRAY_ELEM_WIDTH;
        this.arrayLabels[i] = this.nextIndex++;
        this.arrayRects[i] = this.nextIndex++;
        this.circleObjs[i] = this.nextIndex++;

        // Create rectangles and labels for the array elements
        this.cmd("CreateRectangle", this.arrayRects[i], "",
ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT, this.ArrayXPositions[i],
ARRAY_Y_POS);
        this.cmd("CreateLabel", this.arrayLabels[i], i,
this.ArrayXPositions[i], ARRAY_LABEL_Y_POS);
        this.cmd("SetForegroundColor", this.arrayLabels[i], "#0000FF");
    }

    // Initialize first element to display "-INF" as a placeholder
    this.cmd("SetText", this.arrayRects[0], "-INF");

    // Extra labels for swapping animation
    this.swapLabel1 = this.nextIndex++;
    this.swapLabel2 = this.nextIndex++;
    this.swapLabel3 = this.nextIndex++;
    this.swapLabel4 = this.nextIndex++;
    this.descriptLabel1 = this.nextIndex++;
    this.descriptLabel2 = this.nextIndex++;

    this.cmd("CreateLabel", this.descriptLabel1, "", 20, 10,  0);
    //this.cmd("CreateLabel", this.descriptLabel2, "", this.nextIndex,40, 120, 0);

    // Start the animation for the created array
    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();

    // Listen for the AnimationEnded event
    this.animationManager.addListener("AnimationEnded", this,
this.onAnimationEnded);
};

Heap.prototype.onAnimationEnded = function() {
	console.log("OnAnimationEnded successfully.");
};


Heap.prototype.insertCallback = function(event)
{
	var insertedValue;
	
	insertedValue = (this.insertField.value);
	if (insertedValue != "")
	{
		this.insertField.value = "";
		this.implementAction(this.insertElement.bind(this),insertedValue);
	}
}


Heap.prototype.deleteCallback = function () {
    const valueToDelete = parseFloat(this.deleteField.value.trim());
    this.deleteField.value = ""; // Clear the input field after reading the value

    if (isNaN(valueToDelete)) {
        console.log("Invalid input: Please enter a valid number to delete.");
        return;
    }

    console.log(`Initiating deletion of value: ${valueToDelete}`);
    this.implementAction(this.deleteElement.bind(this), valueToDelete);
};





//TODO:  Make me undoable!!
Heap.prototype.clearCallback = function(event)
{
	this.commands = new Array();
	this.implementAction(this.clear.bind(this),"");
}

//TODO:  Make me undoable!!
Heap.prototype.clear = function()
{
	
	while (this.currentHeapSize > 0)
	{
		this.cmd("Delete", this.circleObjs[this.currentHeapSize]);
		this.cmd("SetText", this.arrayRects[this.currentHeapSize], "");
		this.currentHeapSize--;				
	}
	return this.commands;
}


Heap.prototype.reset = function()
{
	this.currentHeapSize = 0;
}
Heap.prototype.removeSmallestCallback = function(event)
{
	this.implementAction(this.removeSmallest.bind(this),"");
}


Heap.prototype.swap = function(index1, index2)
{
	this.cmd("SetText", this.arrayRects[index1], "");
	this.cmd("SetText", this.arrayRects[index2], "");
	this.cmd("SetText", this.circleObjs[index1], "");
	this.cmd("SetText", this.circleObjs[index2], "");
	this.cmd("CreateLabel", this.swapLabel1, this.arrayData[index1], this.ArrayXPositions[index1],ARRAY_Y_POS);
	this.cmd("CreateLabel", this.swapLabel2, this.arrayData[index2], this.ArrayXPositions[index2],ARRAY_Y_POS);
	this.cmd("CreateLabel", this.swapLabel3, this.arrayData[index1], this.HeapXPositions[index1],this.HeapYPositions[index1]);
	this.cmd("CreateLabel", this.swapLabel4, this.arrayData[index2], this.HeapXPositions[index2],this.HeapYPositions[index2]);
	this.cmd("Move", this.swapLabel1, this.ArrayXPositions[index2],ARRAY_Y_POS)
	this.cmd("Move", this.swapLabel2, this.ArrayXPositions[index1],ARRAY_Y_POS)
	this.cmd("Move", this.swapLabel3, this.HeapXPositions[index2],this.HeapYPositions[index2])
	this.cmd("Move", this.swapLabel4, this.HeapXPositions[index1],this.HeapYPositions[index1])
	var tmp = this.arrayData[index1];
	this.arrayData[index1] = this.arrayData[index2];
	this.arrayData[index2] = tmp;
	this.cmd("Step")
	this.cmd("SetText", this.arrayRects[index1], this.arrayData[index1]);
	this.cmd("SetText", this.arrayRects[index2], this.arrayData[index2]);
	this.cmd("SetText", this.circleObjs[index1], this.arrayData[index1]);
	this.cmd("SetText", this.circleObjs[index2], this.arrayData[index2]);
	this.cmd("Delete", this.swapLabel1);
	this.cmd("Delete", this.swapLabel2);
	this.cmd("Delete", this.swapLabel3);
	this.cmd("Delete", this.swapLabel4);			
	
	
}


Heap.prototype.setIndexHighlight = function(index, highlightVal)
{
	this.cmd("SetHighlight", this.circleObjs[index], highlightVal);
	this.cmd("SetHighlight", this.arrayRects[index], highlightVal);
}

Heap.prototype.pushDown = function(index)
{
	var smallestIndex;
	
	while(true)
	{
		if (index*2 > this.currentHeapSize)
		{
			return;
		}
		
		smallestIndex = 2*index;
		
		if (index*2 + 1 <= this.currentHeapSize)
		{
			this.setIndexHighlight(2*index, 1);
			this.setIndexHighlight(2*index + 1, 1);
			this.cmd("Step");
			this.setIndexHighlight(2*index, 0);
			this.setIndexHighlight(2*index + 1, 0);
			if (this.arrayData[2*index + 1] < this.arrayData[2*index])
			{
				smallestIndex = 2*index + 1;
			}
		}
		this.setIndexHighlight(index, 1);
		this.setIndexHighlight(smallestIndex, 1);
		this.cmd("Step");
		this.setIndexHighlight(index, 0);
		this.setIndexHighlight(smallestIndex, 0);
		
		if (this.arrayData[smallestIndex] < this.arrayData[index])
		{
			this.swap(smallestIndex, index);
			index = smallestIndex;
		}
		else
		{
			return;
		}
		
		
		
	}
}

Heap.prototype.removeSmallest = function(dummy)
{
	this.commands = new Array();
	this.cmd("SetText", this.descriptLabel1, "");
	
	if (this.currentHeapSize == 0)
	{
		this.cmd("SetText", this.descriptLabel1, "Heap is empty, cannot remove smallest element");
		return this.commands;
	}
	
	this.cmd("SetText", this.descriptLabel1, "Removing element:");			
	this.cmd("CreateLabel", this.descriptLabel2, this.arrayData[1],  this.HeapXPositions[1], this.HeapYPositions[1], 0);
	this.cmd("SetText", this.circleObjs[1], "");
	this.cmd("Move", this.descriptLabel2,  120, 40)
	this.cmd("Step");
	this.cmd("Delete", this.descriptLabel2);
	this.cmd("SetText", this.descriptLabel1, "Removing element: " + this.arrayData[1]);
	this.arrayData[1] = "";
	if (this.currentHeapSize > 1)
	{
		this.cmd("SetText", this.arrayRects[1], "");
		this.cmd("SetText", this.arrayRects[this.currentHeapSize], "");
		this.swap(1,this.currentHeapSize);
		this.cmd("Delete", this.circleObjs[this.currentHeapSize]);
		this.currentHeapSize--;
		this.pushDown(1);				
	} else {
                this.cmd("SetText", this.arrayRects[1], "");
		this.cmd("Delete", this.circleObjs[this.currentHeapSize]);
		this.currentHeapSize--;

        }
	return this.commands;
	
}

Heap.prototype.buildHeapCallback = function(event) {
    console.log("BuildHeap button clicked. Initializing heap build...");
    this.implementAction(this.buildHeap.bind(this), "");
};


Heap.prototype.buildHeap = function(ignored) {
	

    console.log("Starting buildHeap process...");
    this.commands = [];
    
    console.log("Clearing the heap...");
    this.clear();
    
	// Generate unique random values between 1 and 100
    const uniqueValues = new Set();
    while (uniqueValues.size < ARRAY_SIZE - 1) { // Adjusting for 1-based index
        uniqueValues.add(Math.floor(Math.random() * 100) + 1);
    }
    
	 // Convert set to array for easy indexing
	 const uniqueArray = Array.from(uniqueValues);

    for (var i = 1; i < ARRAY_SIZE; i++) {
        this.arrayData[i] = parseInt(String(uniqueArray[i - 1])); // Assign unique value
        console.log(`Inserting element at index ${i}: ${this.arrayData[i]}`);
        
        this.cmd("CreateCircle", this.circleObjs[i], this.arrayData[i], this.HeapXPositions[i], this.HeapYPositions[i]);
        this.cmd("SetText", this.arrayRects[i], this.arrayData[i]);
        
        if (i > 1) {
            console.log(`Connecting node at index ${Math.floor(i / 2)} with node at index ${i}`);
            this.cmd("Connect", this.circleObjs[Math.floor(i / 2)], this.circleObjs[i]);
        }
    }
    
    console.log("All elements inserted, initializing heapify process...");
    this.cmd("Step");
    this.currentHeapSize = ARRAY_SIZE - 1;
    
    var nextElem = this.currentHeapSize;
    while (nextElem > 0) {
        console.log(`Pushing down element at index ${nextElem}`);
        this.pushDown(nextElem);
        nextElem = nextElem - 1;
    }
    
    console.log("Heap built successfully.");
    return this.commands;
};


Heap.prototype.insertElement = function(insertedValue)
{
	this.commands = new Array();
	
	if (this.currentHeapSize >= ARRAY_SIZE - 1)
	{
		this.cmd("SetText", this.descriptLabel1, "Heap Full!");
		return this.commands;
	}
	
	this.cmd("SetText", this.descriptLabel1, "Inserting Element: " + insertedValue);	
	this.cmd("Step");
	this.cmd("SetText", this.descriptLabel1, "Inserting Element: ");
	this.currentHeapSize++;
	this.arrayData[this.currentHeapSize] = insertedValue;
	this.cmd("CreateCircle",this.circleObjs[this.currentHeapSize], "", this.HeapXPositions[this.currentHeapSize], this.HeapYPositions[this.currentHeapSize]);
	this.cmd("CreateLabel", this.descriptLabel2, insertedValue, 120, 45,  1);
	if (this.currentHeapSize > 1)
	{
		this.cmd("Connect", this.circleObjs[Math.floor(this.currentHeapSize / 2)], this.circleObjs[this.currentHeapSize]);				
	}
	
	this.cmd("Move", this.descriptLabel2, this.HeapXPositions[this.currentHeapSize], this.HeapYPositions[this.currentHeapSize]);
	this.cmd("Step");
	this.cmd("SetText", this.circleObjs[this.currentHeapSize], insertedValue);
	this.cmd("delete", this.descriptLabel2);
	this.cmd("SetText", this.arrayRects[this.currentHeapSize], insertedValue);
	
	var currentIndex = this.currentHeapSize;
	var parentIndex = Math.floor(currentIndex / 2);
	
	if (currentIndex > 1)
	{
		this.setIndexHighlight(currentIndex, 1);
		this.setIndexHighlight(parentIndex, 1);
		this.cmd("Step");
		this.setIndexHighlight(currentIndex, 0);
		this.setIndexHighlight(parentIndex, 0);
	}
	
	while (currentIndex > 1 && this.arrayData[currentIndex] < this.arrayData[parentIndex])
	{
		this.swap(currentIndex, parentIndex);
		currentIndex = parentIndex;
		parentIndex = Math.floor(parentIndex / 2);
		if (currentIndex > 1)
		{
			this.setIndexHighlight(currentIndex, 1);
			this.setIndexHighlight(parentIndex, 1);
			this.cmd("Step");
			this.setIndexHighlight(currentIndex, 0);
			this.setIndexHighlight(parentIndex, 0);
		}
	}
	this.cmd("SetText", this.descriptLabel1, "");	
	
	return this.commands;
}

Heap.prototype.deleteElement = function(valueToDelete) {
    this.commands = new Array();
    this.cmd("SetText", this.descriptLabel1, "");

    if (this.currentHeapSize == 0) {
        this.cmd("SetText", this.descriptLabel1, "Heap is empty, cannot delete element");
        return this.commands;
    }

    // Find the index of the value to delete
    let indexToDelete = -1;
    for (let i = 1; i <= this.currentHeapSize; i++) {
        if (this.arrayData[i] == valueToDelete) {
            indexToDelete = i;
            break;
        }
    }

    if (indexToDelete == -1) {
        this.cmd("SetText", this.descriptLabel1, `Value ${valueToDelete} not found in the heap`);
        return this.commands;
    }

    this.cmd("SetText", this.descriptLabel1, `Deleting element: ${valueToDelete}`);
    this.cmd("Step");

    if (indexToDelete == this.currentHeapSize) {
        // If it's the last element, just remove it
        this.cmd("Delete", this.circleObjs[indexToDelete]);
        this.cmd("SetText", this.arrayRects[indexToDelete], "");
        this.currentHeapSize--;
    } else {
        // Swap the element with the last element and remove it
        this.swap(indexToDelete, this.currentHeapSize);
        this.cmd("Delete", this.circleObjs[this.currentHeapSize]);
        this.cmd("SetText", this.arrayRects[this.currentHeapSize], "");
        this.currentHeapSize--;

        // Restore heap property by pushing down or bubbling up
        const parentIndex = Math.floor(indexToDelete / 2);

        if (parentIndex > 0 && this.arrayData[indexToDelete] < this.arrayData[parentIndex]) {
            this.bubbleUp(indexToDelete);
        } else {
            this.pushDown(indexToDelete);
        }
    }

    this.cmd("SetText", this.descriptLabel1, `Deleted element: ${valueToDelete}`);
    return this.commands;
};

// Helper method to bubble up the element
Heap.prototype.bubbleUp = function(index) {
    let currentIndex = index;
    let parentIndex = Math.floor(currentIndex / 2);

    while (currentIndex > 1 && this.arrayData[currentIndex] < this.arrayData[parentIndex]) {
        this.swap(currentIndex, parentIndex);
        currentIndex = parentIndex;
        parentIndex = Math.floor(currentIndex / 2);
    }
};

Heap.prototype.disableUI = function(event)
{
	this.insertField.disabled = true;
	this.insertButton.disabled = true;
	this.removeSmallestButton.disabled = true;
	this.clearHeapButton.disabled = true;
	this.buildHeapButton.disabled = true;
	this.randomizeField.disabled = true;
	this.randomizeButton.disabled = true;
}

Heap.prototype.enableUI = function(event)
{
	this.insertField.disabled = false;
	this.insertButton.disabled = false;
	this.removeSmallestButton.disabled = false;
	this.clearHeapButton.disabled = false;
	this.buildHeapButton.disabled = false;
	this.randomizeField.disabled = false;
	this.randomizeButton.disabled = false;
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new Heap(animManag, canvas.width, canvas.height);
}
Heap.txt
