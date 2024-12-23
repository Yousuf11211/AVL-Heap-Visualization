

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

function AVL(am, w, h)
{
	this.init(am, w, h);
    this.randomQueue = [];   // Queue to store values for random insertion
    this.isRandomizing = false;  // Flag to indicate if random insertion is active
}

AVL.prototype = new Algorithm();
AVL.prototype.constructor = AVL;
AVL.superclass = Algorithm.prototype;


// Various constants

AVL.HIGHLIGHT_LABEL_COLOR = "#FFFFFF";   // White for highlight labels
AVL.HIGHLIGHT_LINK_COLOR = "#FFFFFF";    // White for highlight links

AVL.HIGHLIGHT_COLOR = "#000000";         // White for highlight nodes/elements
AVL.HEIGHT_LABEL_COLOR = "#000000";      // Black for height labels

AVL.LINK_COLOR = "#000000";              // Black for links
AVL.HIGHLIGHT_CIRCLE_COLOR = "#FFFFFF";  // White for highlight circles
AVL.FOREGROUND_COLOR = "#000000";        // Black for foreground (text)
AVL.BACKGROUND_COLOR = "#FFFFFF";        // White for background color of the nodes
AVL.PRINT_COLOR = AVL.FOREGROUND_COLOR;

AVL.WIDTH_DELTA  = 50;
AVL.HEIGHT_DELTA = 50;
AVL.STARTING_Y = 50;

AVL.FIRST_PRINT_POS_X  = 50;
AVL.PRINT_VERTICAL_GAP  = 20;
AVL.PRINT_HORIZONTAL_GAP = 50;
AVL.EXPLANITORY_TEXT_X = 10;
AVL.EXPLANITORY_TEXT_Y = 10;



AVL.prototype.init = function(am, w, h)
{
	var sc = AVL.superclass;
	var fn = sc.init;
	this.first_print_pos_y  = h - 2 * AVL.PRINT_VERTICAL_GAP;
	this.print_max = w - 10;
	
	fn.call(this, am, w, h);
	this.startingX = w / 2;
	this.addControls();
	this.nextIndex = 1;
	this.commands = [];
	this.cmd("CreateLabel", 0, "", AVL.EXPLANITORY_TEXT_X, AVL.EXPLANITORY_TEXT_Y, 0);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();

    // Listen for the AnimationEnded event
    this.animationManager.addListener("AnimationEnded", this, this.onAnimationEnded);
	
}

AVL.prototype.onAnimationEnded = function() {
    this.insertNextFromQueue(false);
};

//Insert Field
AVL.prototype.addControls =  function()
{
// Insert field configuration to allow only float values up to 2 decimal places
this.insertField = addControlToAlgorithmBar("Text", "");
this.insertField.size = 5; // Adjust the size for 4-digit entries with 2 decimal places

// Handle keydown event to enforce float input with up to two decimal places
this.insertField.onkeydown = (event) => {
    const key = event.key;
    const currentValue = this.insertField.value;

    console.log(`Key pressed: ${key}`);
    console.log(`Current value: ${currentValue}`);

    // Allow only digits, a decimal point, and control keys (backspace, delete, arrow keys)
    if (!/^[0-9.]$/.test(key) && key !== "Backspace" && key !== "Delete" && key !== "ArrowLeft" && key !== "ArrowRight") {
        console.log("Invalid key pressed. Only digits and a single decimal point are allowed.");
        event.preventDefault(); // Prevent non-numeric, non-control keys
    }

    // Prevent more than one decimal point
    if (key === "." && currentValue.includes(".")) {
        console.log("Decimal point already present, preventing additional decimal.");
        event.preventDefault();
    }

    // Limit to two decimal places
    if (currentValue.includes(".") && currentValue.split(".")[1].length >= 2 && key !== "Backspace" && key !== "Delete") {
        console.log("Two decimal places already present, preventing additional input.");
        event.preventDefault();
    }

    // Restrict input to a maximum of 5 characters (e.g., "9999", "99.99", "10000")
    if (currentValue.length >= 5 && key !== "Backspace" && key !== "Delete" && key !== "ArrowLeft" && key !== "ArrowRight") {
        console.log("Maximum input length of 5 characters reached. Blocking further input.");
        event.preventDefault();
    }

    // Prevent a decimal point at the end of the value (e.g., "1111.")
    if (key === "." && currentValue.endsWith(".")) {
        console.log("Preventing decimal point at the end.");
        event.preventDefault();
    }

    // Prevent multiple leading zeros (e.g., "001" or "00"), but allow "0" or "100"
    if (/^0{2,}/.test(currentValue)) {
        console.log("Multiple leading zeros are not allowed.");
        event.preventDefault();
    }

    // Allow leading zero only if it is followed by a decimal point (e.g., "0." is allowed)
    if (key === "0" && currentValue === "0") {
        event.preventDefault();  // Prevent the insertion of more zeros
        console.log("Only one leading zero is allowed.");
    }
};

// Button configuration
this.insertButton = addControlToAlgorithmBar("Button", "Insert");
this.insertButton.onclick = this.insertCallback.bind(this);
console.log("Insert field and button initialized.");




// Delete field setup for limiting length to 5 characters and 2 decimal places
this.deleteField = addControlToAlgorithmBar("Text", "");
this.deleteField.size = 5;  // Set the size of the input field (to display 5 characters)

// Handle keydown event to enforce input restrictions
this.deleteField.onkeydown = (event) => {
    const key = event.key;
    let currentValue = this.deleteField.value;

    // Allow digits, decimal point, backspace, delete, and arrow keys
    if (/[^0-9\.]/.test(key) && key !== "Backspace" && key !== "Delete" && key !== "ArrowLeft" && key !== "ArrowRight") {
        event.preventDefault();  // Prevent invalid input
        return;
    }

    // Prevent multiple leading zeros (e.g., "001" or "00")
    // Allow leading zero only if it is followed by a decimal point (e.g., "0." is allowed)
	if (key === "0" && currentValue === "0") {
    	event.preventDefault();  // Prevent the insertion of more zeros
    	console.log("Only one leading zero is allowed.");
    }

    // Ensure only one decimal point is allowed
    if (key === "." && currentValue.includes(".")) {
        event.preventDefault();  // Prevent multiple decimal points
        return;
    }

    // Restrict input to a maximum of 5 characters
    if (currentValue.length >= 5 && key !== "Backspace" && key !== "Delete" && key !== "ArrowLeft" && key !== "ArrowRight") {
        event.preventDefault();  // Block further input if length exceeds 5 characters
        return;
    }

    // Prevent a decimal point at the end of the value (e.g., "1111.")
    if (key === "." && currentValue.endsWith(".")) {
        event.preventDefault();  // Prevent decimal point at the end
        return;
    }

    // Ensure there are no more than 2 digits after the decimal point
    const decimalIndex = currentValue.indexOf(".");
    if (decimalIndex !== -1 && currentValue.slice(decimalIndex + 1).length >= 2 && key !== "Backspace" && key !== "Delete") {
        event.preventDefault();  // Prevent more than 2 decimal places
        return;
    }
};

// Delete button setup
this.deleteButton = addControlToAlgorithmBar("Button", "Delete");
this.deleteButton.onclick = this.deleteCallback.bind(this);

console.log("Delete field initialized with length limit of 5 characters, decimal point restrictions, and up to 2 decimal places.");


// Creating the find field
this.findField = addControlToAlgorithmBar("Text", "");
this.findField.size=5;

// Restricting the input to accept valid float or integer values
this.findField.onkeydown = (event) => {
    const key = event.key;

    // Allow digits, decimal point, backspace, and delete
    if (/[^0-9\.]/.test(key) && key !== "Backspace") {
        event.preventDefault();  // Prevent invalid input
    }

    // Ensure only one decimal point is allowed
    if (key === "." && this.findField.value.includes(".")) {
        event.preventDefault();  // Prevent multiple decimal points
    }
};

// Create a button to trigger the find action
this.findButton = addControlToAlgorithmBar("Button", "Find");
this.findButton.onclick = this.findCallback.bind(this);

// Find callback function to handle finding the value
this.findCallback = function() {
    const findValue = parseFloat(this.findField.value); // Get the float value from input field

    if (!isNaN(findValue)) {
        console.log(`Searching for value: ${findValue}`);
        
        // Call a method to find the value in the AVL tree
        const foundValues = this.findInAVL(findValue);
        
        if (foundValues.length > 0) {
            console.log(`Found values: ${foundValues}`);
            alert(`Found values: ${foundValues.join(', ')}`);
        } else {
            console.log("Value not found.");
            alert("Value not found.");
        }

        // Clear the find field after the operation
        this.findField.value = "";
    } else {
        alert("Please enter a valid float value to find.");
    }
};

 // print button
	this.printButton = addControlToAlgorithmBar("Button", "Print");
	this.printButton.onclick = this.printCallback.bind(this);

	// New "Randomize" key size input field and button
	this.randomizeField = addControlToAlgorithmBar("Text", "");
	this.randomizeField.onkeydown = this.returnSubmit(this.randomizeField, this.randomizeCallback.bind(this), 4, true); 
	this.randomizeButton = addControlToAlgorithmBar("Button", "Randomize");
	this.randomizeButton.onclick = this.randomizeCallback.bind(this);
}

AVL.prototype.reset = function()
{
	this.nextIndex = 1;
	this.treeRoot = null;
}

AVL.prototype.randomizeCallback = function(event) {
    const keySize = parseInt(this.randomizeField.value);
	    // Ensure size is valid and within allowed limits
	if (isNaN(keySize) || keySize <= 0 || keySize >= 101) {  
		alert("Please enter a positive integer within a reasonable range(<=100).");
		return;
	}

    else if (!isNaN(keySize) && keySize > 0) {
        this.randomizeField.value = ""; // Clear the input field
        this.isRandomizing = true;      // Set flag to indicate batch insertion
        this.randomQueue = [];

        // Generate unique random values
        const uniqueValues = new Set();
        while (uniqueValues.size < keySize) {
            const randomValue = parseInt(Math.floor(Math.random() * 100) + 1);
            uniqueValues.add(randomValue);
        }
        this.randomQueue = Array.from(uniqueValues);

        console.log("Starting batch insertion with values:", this.randomQueue);
        
        // Start inserting from the queue with a direct call indicator
        this.insertNextFromQueue(true); 
    } else {
        alert("Please enter a valid positive number for the key size.");
    }
};

AVL.prototype.insertNextFromQueue = function(isDirectCall = false) {
    if (this.randomQueue.length === 0) {
        // If the queue is empty, stop processing and log the status
        console.log("No values in the queue to process.");
        this.isRandomizing = false; // Ensure the randomizing flag is reset
        return;
    }

    if (isDirectCall) {
        console.log("Direct call to insertNextFromQueue initiated from randomizeCallback.");
    } else {
        console.log("AnimationEnded event fired. Continuing with next value in queue.");
    }

    // Process next item in the queue if randomizing and queue has values
    if (this.isRandomizing && this.randomQueue.length > 0) {
        // Add a delay before processing the next value in the queue
        setTimeout(() => {
            const nextValue = this.randomQueue.shift();
            console.log(`Inserting value ${nextValue} after delay.`);
            this.implementAction(this.insertElement.bind(this), nextValue);
        }, 500); // 500 ms delay, adjust as needed
    } else if (this.isRandomizing) {
        console.log("All values from randomization queue have been inserted.");
        this.isRandomizing = false;
    }
};



AVL.prototype.insertCallback = function(event) {
    var insertedValue = this.insertField.value;
    
    // Convert the value to a float
    insertedValue = parseFloat(insertedValue);

    // Check if the value is not empty and is a valid number (including 0)
    if (!isNaN(insertedValue) && insertedValue !== "") {
        // Clear the input field after inserting the value
        this.insertField.value = "";
        
        // Implement the action with the inserted value
        this.implementAction(this.insertElement.bind(this), insertedValue);
    } else {
        console.log("Invalid value entered. Insertion ignored.");
    }
};


AVL.prototype.deleteCallback = function(event)
{
	var deletedValue = this.deleteField.value;
	if (deletedValue != "")
	{
		deletedValue =parseFloat(deletedValue);
		this.deleteField.value = "";
		this.implementAction(this.deleteElement.bind(this),deletedValue);		
	}
}


AVL.prototype.findCallback = function(event)
{
	var findValue = this.findField.value;
	if (findValue != "")
	{
		findValue = this.normalizeNumber(findValue, 4);
		this.findField.value = "";
		this.implementAction(this.findElement.bind(this),findValue);		
	}
}

AVL.prototype.printCallback = function(event)
{
	this.implementAction(this.printTree.bind(this),"");						
}

AVL.prototype.sizeChanged = function(newWidth, newHeight)
{
	this.startingX = newWidth / 2;
}

		 
		
AVL.prototype.printTree = function(unused)
{
	this.commands = [];
	
	if (this.treeRoot != null)
	{
		this.highlightID = this.nextIndex++;
		var firstLabel = this.nextIndex;
		this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, this.treeRoot.x, this.treeRoot.y);
		this.xPosOfNextLabel = AVL.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel = this.first_print_pos_y;
		this.printTreeRec(this.treeRoot);
		this.cmd("Delete",this.highlightID);
		this.cmd("Step");
		for (var i = firstLabel; i < this.nextIndex; i++)
			this.cmd("Delete", i);
		this.nextIndex = this.highlightID;  /// Reuse objects.  Not necessary.
	}
	return this.commands;
}

AVL.prototype.printTreeRec = function(tree) 
{
	this.cmd("Step");
	if (tree.left != null)
	{
		this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
		this.printTreeRec(tree.left);
		this.cmd("Move", this.highlightID, tree.x, tree.y);				
		this.cmd("Step");
	}
	var nextLabelID = this.nextIndex++;
	this.cmd("CreateLabel", nextLabelID, tree.data, tree.x, tree.y);
	this.cmd("SetForegroundColor", nextLabelID, AVL.PRINT_COLOR);
	this.cmd("Move", nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
	this.cmd("Step");
	
	this.xPosOfNextLabel +=  AVL.PRINT_HORIZONTAL_GAP;
	if (this.xPosOfNextLabel > this.print_max)
	{
		this.xPosOfNextLabel = AVL.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel += AVL.PRINT_VERTICAL_GAP;
		
	}
	if (tree.right != null)
	{
		this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
		this.printTreeRec(tree.right);
		this.cmd("Move", this.highlightID, tree.x, tree.y);	
		this.cmd("Step");
	}
	return;
}


AVL.prototype.findElement = function(findValue)
{
	this.commands = [];
	
	this.highlightID = this.nextIndex++;
	
	this.doFind(this.treeRoot, findValue);
	
	
	return this.commands;
}


AVL.prototype.doFind = function(tree, value)
{
	this.cmd("SetText", 0, "Searchiing for "+value);
	if (tree != null)
	{
		this.cmd("SetHighlight", tree.graphicID, 1);
		if (tree.data == value)
		{
			this.cmd("SetText", 0, "Searching for "+value+" : " + value + " = " + value + " (Element found!)");
			this.cmd("Step");
			this.cmd("SetText", 0, "Found:"+value);
			this.cmd("SetHighlight", tree.graphicID, 0);
		}
		else
		{
			if (tree.data > value)
			{
				this.cmd("SetText", 0, "Searching for "+value+" : " + value + " < " + tree.data + " (look to left subtree)");
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				if (tree.left!= null)
				{
					this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
					this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
					this.cmd("Step");
					this.cmd("Delete", this.highlightID);
				}
				this.doFind(tree.left, value);
			}
			else
			{
				this.cmd("SetText", 0, " Searching for "+value+" : " + value + " > " + tree.data + " (look to right subtree)");					
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				if (tree.right!= null)
				{
					this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
					this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
					this.cmd("Step");
					this.cmd("Delete", this.highlightID);				
				}
				this.doFind(tree.right, value);						
			}
			
		}
		
	}
	else
	{
		this.cmd("SetText", 0, " Searching for "+value+" : " + "< Empty Tree > (Element not found)");				
		this.cmd("Step");					
		this.cmd("SetText", 0, " Searching for "+value+" : " + " (Element not found)");					
	}
}

AVL.prototype.insertElement = function(insertedValue)
{
	this.commands = [];	
	this.cmd("SetText", 0, " Inserting "+insertedValue);
	
	if (this.treeRoot == null)
	{
		var treeNodeID = this.nextIndex++;
		var labelID  = this.nextIndex++;
		this.cmd("CreateCircle", treeNodeID, insertedValue,  this.startingX, AVL.STARTING_Y);
		this.cmd("SetForegroundColor", treeNodeID, AVL.FOREGROUND_COLOR);
		this.cmd("SetBackgroundColor", treeNodeID, AVL.BACKGROUND_COLOR);
		this.cmd("CreateLabel", labelID, 1,  this.startingX - 20, AVL.STARTING_Y-20);
		this.cmd("SetForegroundColor", labelID, AVL.HEIGHT_LABEL_COLOR);
		this.cmd("Step");				
		this.treeRoot = new AVLNode(insertedValue, treeNodeID, labelID, this.startingX, AVL.STARTING_Y);
		this.treeRoot.height = 1;
	}
	else
	{
		treeNodeID = this.nextIndex++;
		labelID = this.nextIndex++;
		this.highlightID = this.nextIndex++;
		
		this.cmd("CreateCircle", treeNodeID, insertedValue, 30, AVL.STARTING_Y);

		this.cmd("SetForegroundColor", treeNodeID, AVL.FOREGROUND_COLOR);
		this.cmd("SetBackgroundColor", treeNodeID, AVL.BACKGROUND_COLOR);
		this.cmd("CreateLabel", labelID, "",  100-20, 100-20);
		this.cmd("SetForegroundColor", labelID, AVL.HEIGHT_LABEL_COLOR);
		this.cmd("Step");				
		var insertElem = new AVLNode(insertedValue, treeNodeID, labelID, 100, 100)
		
		this.cmd("SetHighlight", insertElem.graphicID, 1);
		insertElem.height = 1;
		this.insert(insertElem, this.treeRoot);
		//				this.resizeTree();				
	}
	this.cmd("SetText", 0, " ");				
	return this.commands;
}


AVL.prototype.singleRotateRight = function(tree)
{
	var B = tree;
	var t3 = B.right;
	var A = tree.left;
	var t1 = A.left;
	var t2 = A.right;
	
	this.cmd("SetText", 0, "Single Rotate Right");
	this.cmd("SetEdgeHighlight", B.graphicID, A.graphicID, 1);
	this.cmd("Step");
	
	
	if (t2 != null)
	{
		this.cmd("Disconnect", A.graphicID, t2.graphicID);																		  
		this.cmd("Connect", B.graphicID, t2.graphicID, AVL.LINK_COLOR);
		t2.parent = B;
	}
	this.cmd("Disconnect", B.graphicID, A.graphicID);
	this.cmd("Connect", A.graphicID, B.graphicID, AVL.LINK_COLOR);
	A.parent = B.parent;
	if (this.treeRoot == B)
	{
		this.treeRoot = A;
	}
	else
	{
		this.cmd("Disconnect", B.parent.graphicID, B.graphicID, AVL.LINK_COLOR);
		this.cmd("Connect", B.parent.graphicID, A.graphicID, AVL.LINK_COLOR)
		if (B.isLeftChild())
		{
			B.parent.left = A;
		}
		else
		{
			B.parent.right = A;
		}
	}
	A.right = B;
	B.parent = A;
	B.left = t2;
	this. resetHeight(B);
	this. resetHeight(A);
	this.resizeTree();			
}



AVL.prototype.singleRotateLeft = function(tree)
{
	var A = tree;
	var B = tree.right;
	var t1 = A.left;
	var t2 = B.left;
	var t3 = B.right;
	
	this.cmd("SetText", 0, "Single Rotate Left");
	this.cmd("SetEdgeHighlight", A.graphicID, B.graphicID, 1);
	this.cmd("Step");
	
	if (t2 != null)
	{
		this.cmd("Disconnect", B.graphicID, t2.graphicID);																		  
		this.cmd("Connect", A.graphicID, t2.graphicID, AVL.LINK_COLOR);
		t2.parent = A;
	}
	this.cmd("Disconnect", A.graphicID, B.graphicID);
	this.cmd("Connect", B.graphicID, A.graphicID, AVL.LINK_COLOR);
	B.parent = A.parent;
	if (this.treeRoot == A)
	{
		this.treeRoot = B;
	}
	else
	{
		this.cmd("Disconnect", A.parent.graphicID, A.graphicID, AVL.LINK_COLOR);
		this.cmd("Connect", A.parent.graphicID, B.graphicID, AVL.LINK_COLOR)
		
		if (A.isLeftChild())
		{
			A.parent.left = B;
		}
		else
		{
			A.parent.right = B;
		}
	}
	B.left = A;
	A.parent = B;
	A.right = t2;
	this. resetHeight(A);
	this. resetHeight(B);
	
	this.resizeTree();			
}




AVL.prototype.getHeight = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
	return tree.height;
}

AVL.prototype.resetHeight = function(tree)
{
	if (tree != null)
	{
		var newHeight = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
		if (tree.height != newHeight)
		{
			tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1
			this.cmd("SetText",tree.heightLabelID, newHeight);
//			this.cmd("SetText",tree.heightLabelID, newHeight);
		}
	}
}

AVL.prototype.doubleRotateRight = function(tree)
{
	this.cmd("SetText", 0, "Double Rotate Right");
	var A = tree.left;
	var B = tree.left.right;
	var C = tree;
	var t1 = A.left;
	var t2 = B.left;
	var t3 = B.right;
	var t4 = C.right;
	
	this.cmd("Disconnect", C.graphicID, A.graphicID);
	this.cmd("Disconnect", A.graphicID, B.graphicID);
	this.cmd("Connect", C.graphicID, A.graphicID, AVL.HIGHLIGHT_LINK_COLOR);
	this.cmd("Connect", A.graphicID, B.graphicID, AVL.HIGHLIGHT_LINK_COLOR);
	this.cmd("Step");
	
	if (t2 != null)
	{
		this.cmd("Disconnect",B.graphicID, t2.graphicID);
		t2.parent = A;
		A.right = t2;
		this.cmd("Connect", A.graphicID, t2.graphicID, AVL.LINK_COLOR);
	}
	if (t3 != null)
	{
		this.cmd("Disconnect",B.graphicID, t3.graphicID);
		t3.parent = C;
		C.left = t2;
		this.cmd("Connect", C.graphicID, t3.graphicID, AVL.LINK_COLOR);
	}
	if (C.parent == null)
	{
		B.parent = null;
		this.treeRoot = B;
	}
	else
	{
		this.cmd("Disconnect",C.parent.graphicID, C.graphicID);
		this.cmd("Connect",C.parent.graphicID, B.graphicID, AVL.LINK_COLOR);
		if (C.isLeftChild())
		{
			C.parent.left = B
		}
		else
		{
			C.parent.right = B;
		}
		B.parent = C.parent;
		C.parent = B;
	}
	this.cmd("Disconnect", C.graphicID, A.graphicID);
	this.cmd("Disconnect", A.graphicID, B.graphicID);
	this.cmd("Connect", B.graphicID, A.graphicID, AVL.LINK_COLOR);
	this.cmd("Connect", B.graphicID, C.graphicID, AVL.LINK_COLOR);
	B.left = A;
	A.parent = B;
	B.right=C;
	C.parent=B;
	A.right=t2;
	C.left = t3;
	this. resetHeight(A);
	this. resetHeight(C);
	this. resetHeight(B);
	
	this.resizeTree();
	
	
}

AVL.prototype.doubleRotateLeft = function(tree)
{
	this.cmd("SetText", 0, "Double Rotate Left");
	var A = tree;
	var B = tree.right.left;
	var C = tree.right;
	var t1 = A.left;
	var t2 = B.left;
	var t3 = B.right;
	var t4 = C.right;
	
	this.cmd("Disconnect", A.graphicID, C.graphicID);
	this.cmd("Disconnect", C.graphicID, B.graphicID);
	this.cmd("Connect", A.graphicID, C.graphicID, AVL.HIGHLIGHT_LINK_COLOR);
	this.cmd("Connect", C.graphicID, B.graphicID, AVL.HIGHLIGHT_LINK_COLOR);
	this.cmd("Step");
	
	if (t2 != null)
	{
		this.cmd("Disconnect",B.graphicID, t2.graphicID);
		t2.parent = A;
		A.right = t2;
		this.cmd("Connect", A.graphicID, t2.graphicID, AVL.LINK_COLOR);
	}
	if (t3 != null)
	{
		this.cmd("Disconnect",B.graphicID, t3.graphicID);
		t3.parent = C;
		C.left = t2;
		this.cmd("Connect", C.graphicID, t3.graphicID, AVL.LINK_COLOR);
	}
		
	
	if (A.parent == null)
	{
		B.parent = null;
		this.treeRoot = B;
	}
	else
	{
		this.cmd("Disconnect",A.parent.graphicID, A.graphicID);
		this.cmd("Connect",A.parent.graphicID, B.graphicID, AVL.LINK_COLOR);
		if (A.isLeftChild())
		{
			A.parent.left = B
		}
		else
		{
			A.parent.right = B;
		}
		B.parent = A.parent;
		A.parent = B;
	}
	this.cmd("Disconnect", A.graphicID, C.graphicID);
	this.cmd("Disconnect", C.graphicID, B.graphicID);
	this.cmd("Connect", B.graphicID, A.graphicID, AVL.LINK_COLOR);
	this.cmd("Connect", B.graphicID, C.graphicID, AVL.LINK_COLOR);
	B.left = A;
	A.parent = B;
	B.right=C;
	C.parent=B;
	A.right=t2;
	C.left = t3;
	this. resetHeight(A);
	this. resetHeight(C);
	this. resetHeight(B);
	
	this.resizeTree();
	
	
}

AVL.prototype.insert = function(elem, tree)
{
	this.cmd("SetHighlight", tree.graphicID, 1);
	this.cmd("SetHighlight", elem.graphicID, 1);
	
	if (elem.data < tree.data)
	{
		this.cmd("SetText", 0, elem.data + " < " + tree.data + ".  Looking at left subtree");				
	}
	else
	{
		this.cmd("SetText",  0, elem.data + " >= " + tree.data + ".  Looking at right subtree");				
	}
	this.cmd("Step");
	this.cmd("SetHighlight", tree.graphicID , 0);
	this.cmd("SetHighlight", elem.graphicID, 0);
	
	if (elem.data < tree.data)
	{
		if (tree.left == null)
		{
			this.cmd("SetText", 0, "Found null tree, inserting element");				
			this.cmd("SetText",elem.heightLabelID,1); 
			
			this.cmd("SetHighlight", elem.graphicID, 0);
			tree.left=elem;
			elem.parent = tree;
			this.cmd("Connect", tree.graphicID, elem.graphicID, AVL.LINK_COLOR);
			
			this.resizeTree();
			this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.left.x, tree.left.y);
			this.cmd("Move", this.highlightID, tree.x, tree.y);
			this.cmd("SetText",  0, "Unwinding Recursion");			
			this.cmd("Step");
			this.cmd("Delete", this.highlightID);
			
			if (tree.height < tree.left.height + 1)
			{
				tree.height = tree.left.height + 1
				this.cmd("SetText",tree.heightLabelID,tree.height); 
				this.cmd("SetText",  0, "Adjusting height after recursive call");			
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
				this.cmd("Step");
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HEIGHT_LABEL_COLOR);						
			}
		}
		else
		{
			this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
			this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
			this.cmd("Step");
			this.cmd("Delete", this.highlightID);
			this.insert(elem, tree.left);
			this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.left.x, tree.left.y);
			this.cmd("Move", this.highlightID, tree.x, tree.y);
			this.cmd("SetText",  0,"Unwinding Recursion");			
			this.cmd("Step");
			this.cmd("Delete", this.highlightID);
			
			if (tree.height < tree.left.height + 1)
			{
				tree.height = tree.left.height + 1
				this.cmd("SetText",tree.heightLabelID,tree.height); 
				this.cmd("SetText",  0, "Adjusting height after recursive call");			
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
				this.cmd("Step");
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HEIGHT_LABEL_COLOR);
				
			}
			if ((tree.right != null && tree.left.height > tree.right.height + 1) ||
				(tree.right == null && tree.left.height > 1))
			{
				if (elem.data < tree.left.data)
				{
					this.singleRotateRight(tree);
				}
				else
				{
					this.doubleRotateRight(tree);
				}
			}
		}
	}
	else
	{
		if (tree.right == null)
		{
			this.cmd("SetText",  0, "Found null tree, inserting element");			
			this.cmd("SetText", elem.heightLabelID,1); 
			this.cmd("SetHighlight", elem.graphicID, 0);
			tree.right=elem;
			elem.parent = tree;
			this.cmd("Connect", tree.graphicID, elem.graphicID, AVL.LINK_COLOR);
			elem.x = tree.x + AVL.WIDTH_DELTA/2;
			elem.y = tree.y + AVL.HEIGHT_DELTA
			this.cmd("Move", elem.graphicID, elem.x, elem.y);
			
			this.resizeTree();
			
			
			this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.right.x, tree.right.y);
			this.cmd("Move", this.highlightID, tree.x, tree.y);
			this.cmd("SetText",  0, "Unwinding Recursion");			
			this.cmd("Step");
			this.cmd("Delete", this.highlightID);
			
			if (tree.height < tree.right.height + 1)
			{
				tree.height = tree.right.height + 1
				this.cmd("SetText",tree.heightLabelID,tree.height); 
				this.cmd("SetText",   0, "Adjusting height after recursive call");			
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
				this.cmd("Step");
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HEIGHT_LABEL_COLOR);						
			}
			
		}
		else
		{
			this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
			this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
			this.cmd("Step");
			this.cmd("Delete", this.highlightID);
			this.insert(elem, tree.right);
			this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.right.x, tree.right.y);
			this.cmd("Move", this.highlightID, tree.x, tree.y);
			this.cmd("SetText",  0, "Unwinding Recursion");			
			this.cmd("Step");
			this.cmd("Delete", this.highlightID);
			if (tree.height < tree.right.height + 1)
			{
				tree.height = tree.right.height + 1
				this.cmd("SetText",tree.heightLabelID,tree.height); 
				this.cmd("SetText",  0, "Adjusting height after recursive call");			
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
				this.cmd("Step");
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HEIGHT_LABEL_COLOR);
				
				
			}
			if ((tree.left != null && tree.right.height > tree.left.height + 1) ||
				(tree.left == null && tree.right.height > 1))
			{
				if (elem.data >= tree.right.data)
				{
					this.singleRotateLeft(tree);
				}
				else
				{
					this.doubleRotateLeft(tree);
				}
			}
		}
	}
	
	
}

AVL.prototype.deleteElement = function(deletedValue)
{
	this.commands = [];
	this.cmd("SetText", 0, "Deleting "+deletedValue);
	this.cmd("Step");
	this.cmd("SetText", 0, " ");
	this.highlightID = this.nextIndex++;
	this.treeDelete(this.treeRoot, deletedValue);
	this.cmd("SetText", 0, " ");			
	return this.commands;						
}

AVL.prototype.treeDelete = function(tree, valueToDelete)
{
	var leftchild = false;
	if (tree != null)
	{
		if (tree.parent != null)
		{
			leftchild = tree.parent.left == tree;
		}
		this.cmd("SetHighlight", tree.graphicID, 1);
		if (valueToDelete < tree.data)
		{	
			this.cmd("SetText", 0, valueToDelete + " < " + tree.data + ".  Looking at left subtree");				
		}
		else if (valueToDelete > tree.data)
		{
			this.cmd("SetText", 0, valueToDelete + " > " + tree.data + ".  Looking at right subtree");				
		}
		else
		{
			this.cmd("SetText", 0, valueToDelete + " == " + tree.data + ".  Found node to delete");									
		}
		this.cmd("Step");
		this.cmd("SetHighlight", tree.graphicID, 0);
		
		if (valueToDelete == tree.data)
		{
			if (tree.left == null && tree.right == null)
			{
				this.cmd("SetText",  0, "Node to delete is a leaf.  Delete it.");									
				this.cmd("Delete", tree.graphicID);
				this.cmd("Delete", tree.heightLabelID);
				if (leftchild && tree.parent != null)
				{
					tree.parent.left = null;
				}
				else if (tree.parent != null)
				{
					tree.parent.right = null;
				}
				else
				{
					this.treeRoot = null;
				}
				this.resizeTree();				
				this.cmd("Step");
				
			}
			else if (tree.left == null)
			{
				this.cmd("SetText", 0, "Node to delete has no left child.  \nSet parent of deleted node to right child of deleted node.");									
				if (tree.parent != null)
				{
					this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
					this.cmd("Connect", tree.parent.graphicID, tree.right.graphicID, AVL.LINK_COLOR);
					this.cmd("Step");
					this.cmd("Delete", tree.graphicID);
					this.cmd("Delete", tree.heightLabelID);
					if (leftchild)
					{
						tree.parent.left = tree.right;
					}
					else
					{
						tree.parent.right = tree.right;
					}
					tree.right.parent = tree.parent;
				}
				else
				{
					this.cmd("Delete", tree.graphicID);
					this.cmd("Delete", tree.heightLabelID);
					this.treeRoot = tree.right;
					this.treeRoot.parent = null;
				}
				this.resizeTree();				
			}
			else if (tree.right == null)
			{
				this.cmd("SetText",  0,"Node to delete has no right child.  \nSet parent of deleted node to left child of deleted node.");									
				if (tree.parent != null)
				{
					this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
					this.cmd("Connect", tree.parent.graphicID, tree.left.graphicID, AVL.LINK_COLOR);
					this.cmd("Step");
					this.cmd("Delete", tree.graphicID);
					this.cmd("Delete", tree.heightLabelID);
					if (leftchild)
					{
						tree.parent.left = tree.left;								
					}
					else
					{
						tree.parent.right = tree.left;
					}
					tree.left.parent = tree.parent;
				}
				else
				{
					this.cmd("Delete" , tree.graphicID);
					this.cmd("Delete", tree.heightLabelID);
					this.treeRoot = tree.left;
					this.treeRoot.parent = null;
				}
				this.resizeTree();
			}
			else // tree.left != null && tree.right != null
			{
				this.cmd("SetText", 0, "Node to delete has two childern.  \nFind largest node in left subtree.");									
				
				this.highlightID = this.nextIndex;
				this.nextIndex += 1;
				this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
				var tmp = tree;
				tmp = tree.left;
				this.cmd("Move", this.highlightID, tmp.x, tmp.y);
				this.cmd("Step");																									
				while (tmp.right != null)
				{
					tmp = tmp.right;
					this.cmd("Move", this.highlightID, tmp.x, tmp.y);
					this.cmd("Step");																									
				}
				this.cmd("SetText", tree.graphicID, " ");
				var labelID = this.nextIndex;
				this.nextIndex += 1;
				this.cmd("CreateLabel", labelID, tmp.data, tmp.x, tmp.y);
				this.cmd("SetForegroundColor", labelID, AVL.HEIGHT_LABEL_COLOR);
				tree.data = tmp.data;
				this.cmd("Move", labelID, tree.x, tree.y);
				this.cmd("SetText", 0, "Copy largest value of left subtree into node to delete.");									
				
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.cmd("Delete", labelID);
				this.cmd("SetText", tree.graphicID, tree.data);
				this.cmd("Delete", this.highlightID);							
				this.cmd("SetText", 0, "Remove node whose value we copied.");									
				
				if (tmp.left == null)
				{
					if (tmp.parent != tree)
					{
						tmp.parent.right = null;
					}
					else
					{
						tree.left = null;
					}
					this.cmd("Delete", tmp.graphicID);
					this.cmd("Delete", tmp.heightLabelID);
					this.resizeTree();
				}
				else
				{
					this.cmd("Disconnect", tmp.parent.graphicID, tmp.graphicID);
					this.cmd("Connect", tmp.parent.graphicID, tmp.left.graphicID, AVL.LINK_COLOR);
					this.cmd("Step");
					this.cmd("Delete", tmp.graphicID);
					this.cmd("Delete", tmp.heightLabelID);
					if (tmp.parent != tree)
					{
						tmp.parent.right = tmp.left;
						tmp.left.parent = tmp.parent;
					}
					else
					{
						tree.left = tmp.left;
						tmp.left.parent = tree;
					}
					this.resizeTree();
				}
				tmp = tmp.parent;
				
				if (this.getHeight(tmp) != Math.max(this.getHeight(tmp.left), this.getHeight(tmp.right)) + 1)
				{
					tmp.height = Math.max(this.getHeight(tmp.left), this.getHeight(tmp.right)) + 1
					this.cmd("SetText",tmp.heightLabelID,tmp.height); 
					this.cmd("SetText",  0, "Adjusting height after recursive call");			
					this.cmd("SetForegroundColor", tmp.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
					this.cmd("Step");
					this.cmd("SetForegroundColor", tmp.heightLabelID, AVL.HEIGHT_LABEL_COLOR);						
				}
				
				
				
				while (tmp != tree)
				{
					var tmpPar = tmp.parent;
					// TODO:  Add extra animation here?
					if (this.getHeight(tmp.left)- this.getHeight(tmp.right) > 1)
					{
						if (this.getHeight(tmp.left.right) > this.getHeight(tmp.left.left))
						{
							this.doubleRotateRight(tmp);
						}
						else
						{
							this.singleRotateRight(tmp);
						}
					}
					if (tmpPar.right != null)
					{
						if (tmpPar == tree)
						{
							this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tmpPar.left.x, tmpPar.left.y);
							
						}
						else
						{
							this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tmpPar.right.x, tmpPar.right.y);
						}
						this.cmd("Move", this.highlightID, tmpPar.x, tmpPar.y);
						this.cmd("SetText",  0, "Backing up ...");			
						
			if (this.getHeight(tmpPar) != Math.max(this.getHeight(tmpPar.left), this.getHeight(tmpPar.right)) + 1)
			{
				tmpPar.height = Math.max(this.getHeight(tmpPar.left), this.getHeight(tmpPar.right)) + 1
				this.cmd("SetText",tmpPar.heightLabelID,tree.height); 
				this.cmd("SetText",  0, "Adjusting height after recursive call");			
				this.cmd("SetForegroundColor", tmpPar.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
				this.cmd("Step");
				this.cmd("SetForegroundColor", tmpPar.heightLabelID, AVL.HEIGHT_LABEL_COLOR);						
			}

//28,15,50,7,22,39,55,10,33,42,63,30 .
					    

						this.cmd("Step");
						this.cmd("Delete", this.highlightID);
					}
					tmp = tmpPar;
				}
				if (this.getHeight(tree.right)- this.getHeight(tree.left) > 1)
				{
					if (this.getHeight(tree.right.left) > this.getHeight(tree.right.right))
					{
						this.doubleRotateLeft(tree);
					}
					else
					{
						this.singleRotateLeft(tree);
					}					
				}
				
			}
		}
		else if (valueToDelete < tree.data)
		{
			if (tree.left != null)
			{
				this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
				this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
				this.cmd("Step");
				this.cmd("Delete", this.highlightID);
			}
			this.treeDelete(tree.left, valueToDelete);
			if (tree.left != null)
			{
				this.cmd("SetText", 0, "Unwinding recursion.");
				this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.left.x, tree.left.y);
				this.cmd("Move", this.highlightID, tree.x, tree.y);
				this.cmd("Step");
				this.cmd("Delete", this.highlightID);
			}
			if (this.getHeight(tree.right)- this.getHeight(tree.left) > 1)
			{
				if (this.getHeight(tree.right.left) > this.getHeight(tree.right.right))
				{
					this.doubleRotateLeft(tree);
				}
				else
				{
					this.singleRotateLeft(tree);
				}					
			}
			if (this.getHeight(tree) != Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1)
			{
				tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1
				this.cmd("SetText",tree.heightLabelID,tree.height); 
				this.cmd("SetText",  0, "Adjusting height after recursive call");			
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
				this.cmd("Step");
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HEIGHT_LABEL_COLOR);						
			}
		}
		else
		{
			if (tree.right != null)
			{
				this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
				this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
				this.cmd("Step");
				this.cmd("Delete", this.highlightID);
			}
			this.treeDelete(tree.right, valueToDelete);
			if (tree.right != null)
			{
				this.cmd("SetText", 0, "Unwinding recursion.");
				this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.right.x, tree.right.y);
				this.cmd("Move", this.highlightID, tree.x, tree.y);
				this.cmd("Step");
				this.cmd("Delete", this.highlightID);
			}
			
			
			if (this.getHeight(tree.left)- this.getHeight(tree.right) > 1)
			{
				if (this.getHeight(tree.left.right) > this.getHeight(tree.left.left))
				{
					this.doubleRotateRight(tree);
				}
				else
				{
					this.singleRotateRight(tree);
				}					
			}
			if (this.getHeight(tree) != Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1)
			{
				tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1
				this.cmd("SetText",tree.heightLabelID,tree.height); 
				this.cmd("SetText",  0, "Adjusting height after recursive call");			
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
				this.cmd("Step");
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HEIGHT_LABEL_COLOR);						
			}
			
			
		}
	}
	else
	{
		this.cmd("SetText", 0, "Elemet "+valueToDelete+" not found, could not delete");
	}
	
}

AVL.prototype.resizeTree = function()
{
	var startingPoint  = this.startingX;
	this.resizeWidths(this.treeRoot);
	if (this.treeRoot != null)
	{
		if (this.treeRoot.leftWidth > startingPoint)
		{
			startingPoint = this.treeRoot.leftWidth;
		}
		else if (this.treeRoot.rightWidth > startingPoint)
		{
			startingPoint = Math.max(this.treeRoot.leftWidth, 2 * startingPoint - this.treeRoot.rightWidth);
		}
		this.setNewPositions(this.treeRoot, startingPoint, AVL.STARTING_Y, 0);
		this.animateNewPositions(this.treeRoot);
		this.cmd("Step");
	}
	
}

AVL.prototype.setNewPositions = function(tree, xPosition, yPosition, side)
{
	if (tree != null)
	{
		tree.y = yPosition;
		if (side == -1)
		{
			xPosition = xPosition - tree.rightWidth;
			tree.heightLabelX = xPosition - 20;
		}
		else if (side == 1)
		{
			xPosition = xPosition + tree.leftWidth;
			tree.heightLabelX = xPosition + 20;
		}
		else
		{
			tree.heightLabelX = xPosition - 20;
		}
		tree.x = xPosition;
		tree.heightLabelY = tree.y - 20;
		this.setNewPositions(tree.left, xPosition, yPosition + AVL.HEIGHT_DELTA, -1)
		this.setNewPositions(tree.right, xPosition, yPosition + AVL.HEIGHT_DELTA, 1)
	}
	
}
AVL.prototype.animateNewPositions = function(tree)
{
	if (tree != null)
	{
		this.cmd("Move", tree.graphicID, tree.x, tree.y);
		this.cmd("Move", tree.heightLabelID, tree.heightLabelX, tree.heightLabelY);
		this.animateNewPositions(tree.left);
		this.animateNewPositions(tree.right);
	}
}

AVL.prototype.resizeWidths = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
	tree.leftWidth = Math.max(this.resizeWidths(tree.left), AVL.WIDTH_DELTA / 2);
	tree.rightWidth = Math.max(this.resizeWidths(tree.right), AVL.WIDTH_DELTA / 2);
	return tree.leftWidth + tree.rightWidth;
}


AVL.prototype.disableUI = function(event)
{
	this.insertField.disabled = true;
	this.insertButton.disabled = true;
	this.deleteField.disabled = true;
	this.deleteButton.disabled = true;
	this.findField.disabled = true;
	this.findButton.disabled = true;
	this.printButton.disabled = true;
}

AVL.prototype.enableUI = function(event)
{
	this.insertField.disabled = false;
	this.insertButton.disabled = false;
	this.deleteField.disabled = false;
	this.deleteButton.disabled = false;
	this.findField.disabled = false;
	this.findButton.disabled = false;
	this.printButton.disabled = false;
}

		
function AVLNode(val, id, hid, initialX, initialY)
{
	this.data = val;
	this.x = initialX;
	this.y = initialY;
	this.heightLabelID= hid;
	this.height = 1;
	
	this.graphicID = id;
	this.left = null;
	this.right = null;
	this.parent = null;
}
		
AVLNode.prototype.isLeftChild = function()		
{
	if (this. parent == null)
	{
		return true;
	}
	return this.parent.left == this;	
}




var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new AVL(animManag, canvas.width, canvas.height);
}

