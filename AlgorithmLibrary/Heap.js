function Heap(am)
{
	this.init(am);

}

Heap.prototype = new Algorithm();
Heap.prototype.constructor = Heap;
Heap.superclass = Algorithm.prototype;


var ARRAY_SIZE  = 30;
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
}
Heap.prototype.addControls =  function()
{
	this.insertField = addControlToAlgorithmBar("Text", "");
	this.insertField.onkeydown = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 4);
	this.insertButton = addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick = this.insertCallback.bind(this);

	this.deleteField = addControlToAlgorithmBar("Text", "");
	this.deleteField.onkeydown = this.returnSubmit(this.deleteField,  this.deleteKeyCallback.bind(this), 4);
	this.deleteButton = addControlToAlgorithmBar("Button", "Delete");
	this.deleteButton.onclick = this.deleteKeyCallback.bind(this);
	
	this.removeSmallestButton = addControlToAlgorithmBar("Button", "Remove Smallest");
	this.removeSmallestButton.onclick = this.removeSmallestCallback.bind(this);

	this.clearHeapButton = addControlToAlgorithmBar("Button", "Clear Heap");
	this.clearHeapButton.onclick = this.clearCallback.bind(this);

	this.keySizeField = addControlToAlgorithmBar("Text", "");
	this.keySizeField.onkeydown = this.returnSubmit(this.keySizeField,  this.buildHeapCallback.bind(this), 4);
	this.buildHeapButton = addControlToAlgorithmBar("Button", "BuildHeap");
	this.buildHeapButton.onclick = this.buildHeapCallback.bind(this);
}


Heap.prototype.createArray = function()
{
	this.arrayData = new Array(ARRAY_SIZE);
	this.arrayLabels = new Array(ARRAY_SIZE);
	this.arrayRects = new Array(ARRAY_SIZE);
	this.circleObjs = new Array(ARRAY_SIZE);
	this.ArrayXPositions = new Array(ARRAY_SIZE);
	this.currentHeapSize = 0;

	for (var i = 0; i < ARRAY_SIZE; i++)
	{
		this.ArrayXPositions[i] = ARRAY_INITIAL_X + i *ARRAY_ELEM_WIDTH;
		this.arrayLabels[i] = this.nextIndex++;
		this.arrayRects[i] = this.nextIndex++;
		this.circleObjs[i] = this.nextIndex++;
		this.cmd("CreateRectangle", this.arrayRects[i], "", ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT, this.ArrayXPositions[i] , ARRAY_Y_POS)
		this.cmd("SetForegroundColor", this.arrayRects[i], "#808080"); // Set to grey
		this.cmd("CreateLabel", this.arrayLabels[i], i,  this.ArrayXPositions[i], ARRAY_LABEL_Y_POS);
		this.cmd("SetForegroundColor", this.arrayLabels[i], "#FFA500");
	}
	this.cmd("SetText", this.arrayRects[0], "-INF");
	this.swapLabel1 = this.nextIndex++;
	this.swapLabel2 = this.nextIndex++;
	this.swapLabel3 = this.nextIndex++;
	this.swapLabel4 = this.nextIndex++;
	this.descriptLabel1 = this.nextIndex++;
	this.descriptLabel2 = this.nextIndex++;
	this.cmd("CreateLabel", this.descriptLabel1, "", 20, 10,  0);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
}

Heap.prototype.deleteKeyCallback = function(event) {
    const keyToDelete = parseInt(this.deleteField.value, 10);
    this.deleteField.value = ""; // Clear the delete field

    if (isNaN(keyToDelete)) {
        console.log("Invalid input: Please enter a valid number to delete.");
        return;
    }

    // Find the index of the key to delete in the heap array
    let index = -1;
    for (let i = 1; i <= this.currentHeapSize; i++) {
        if (parseInt(this.arrayData[i]) === keyToDelete) {
            index = i;
            break;
        }
    }

    if (index === -1) {
        console.log(`Key ${keyToDelete} not found in the heap.`);
        return;
    }

    // Debugging Information
    console.log(`Deleting key ${keyToDelete} at index ${index}.`);
    this.commands = []; // Clear previous commands

    // Step 1: Highlight the target node to delete
    this.cmd("SetHighlight", this.circleObjs[index], 1);
    this.cmd("Step");

    // Step 2: Move last element to the deleted node's position, clear last element
    if (index !== this.currentHeapSize) {
        console.log(`Replacing value at index ${index} with last element: ${this.arrayData[this.currentHeapSize]}`);
        this.cmd("SetText", this.circleObjs[index], this.arrayData[this.currentHeapSize]);
        this.arrayData[index] = this.arrayData[this.currentHeapSize];
    }
    this.cmd("Delete", this.circleObjs[this.currentHeapSize]);
    this.currentHeapSize--;

    // Remove highlight
    this.cmd("SetHighlight", this.circleObjs[index], 0);
    console.log("Last element deleted. Current heap size:", this.currentHeapSize);

    // Step 3: Check if heap property needs to be restored
    if (index <= this.currentHeapSize) {
        // Step 4: Apply `pushDown` to maintain heap order after deletion
        this.pushDown(index);
        console.log(`Heap rebalanced starting from index ${index}`);
    } else {
        console.log("No rebalancing needed as this was the last element.");
    }

    // Final Step: Execute all commands for animation
    return this.commands;
};














Heap.prototype.insertCallback = function(event)
{
	var insertedValue;
	
	insertedValue = this.normalizeNumber(this.insertField.value, 4);
	if (insertedValue != "")
	{
		this.insertField.value = "";
		this.implementAction(this.insertElement.bind(this),insertedValue);
	}
}


Heap.prototype.clearCallback = function(event)
{
	this.commands = new Array();
	this.implementAction(this.clear.bind(this),"");
}
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

Heap.prototype.buildHeapCallback = function(event)
{
	this.implementAction(this.buildHeap.bind(this),"");			
}

Heap.prototype.buildHeap = function(ignored)
{
	var keySizeFieldValue;
	this.commands = [];
	this.clear();
	keySizeFieldValue =this.keySizeField.value;
	if (keySizeFieldValue != "")
	{
		ARRAY_SIZE=parseInt(keySizeFieldValue, 10) + 1;
		//this.createArray();
	}
	
	for (var i = 1; i <ARRAY_SIZE; i++)
	{
		this.arrayData[i] = this.normalizeNumber(String(Math.floor(Math.random() * 101)), 4);
		this.cmd("CreateCircle", this.circleObjs[i], this.arrayData[i], this.HeapXPositions[i], this.HeapYPositions[i]);
		this.cmd("SetText", this.arrayRects[i], this.arrayData[i]);
		if (i > 1)
		{
			this.cmd("Connect", this.circleObjs[Math.floor(i/2)], this.circleObjs[i]);
		}
		
	}
	this.cmd("Step");
	this.currentHeapSize = ARRAY_SIZE - 1;
	var nextElem = this.currentHeapSize;
	while(nextElem > 0)
	{
		this.pushDown(nextElem);
		nextElem = nextElem - 1;
	}
	return this.commands;
}

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

Heap.prototype.disableUI = function(event)
{
	this.insertField.disabled = true;
	this.insertButton.disabled = true;
	this.removeSmallestButton.disabled = true;
	this.clearHeapButton.disabled = true;
	this.buildHeapButton.disabled = true;
}

Heap.prototype.enableUI = function(event)
{
	this.insertField.disabled = false;
	this.insertButton.disabled = false;
	this.removeSmallestButton.disabled = false;
	this.clearHeapButton.disabled = false;
	this.buildHeapButton.disabled = false;
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new Heap(animManag, canvas.width, canvas.height);
}
