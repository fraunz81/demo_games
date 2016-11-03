
//use 'strict';

function getKeyCode(ev)
{
	if (!ev)
		ev = window.event;
		
	if ((typeof(ev.which) == "undefined" || (typeof(ev.which) == "number" && ev.which == 0)) && typeof(ev.keyCode) == "number")
		return ev.keyCode;
	else	
		return ev.which;
}

var nsTetris = nsTetris || {};	// namespace deklarieren

/************************************ Klasse Spielstein **************************************************/
//Klasse für die Spielsteine
nsTetris.Spielstein = function()
{
	this.block = null;
	this.blkColor = '';

	this.initSpielstein();
};

nsTetris.Spielstein.prototype.initSpielstein = function()
{
	var blkColor = ['yellow', 'orange', 'red', 'green', 'blue', 'purple', 'black'];
	var block = [];
	var self = null;
	
	block[0] = [[true, true, true, true]];	// I
	block[1] = [[true, false, false],
				[true, true, true]];		// J
	block[2] = [[false, false, true],
				[true, true, true]];		// L
	block[3] = [[true, true],
				[true, true]];				// O
	block[4] = [[false, true, true],
				[true, true, false]];		// S
	block[5] = [[false, true, false],
				[true, true, true]];		// T
	block[6] = [[true, true, false],
				[false, true, true]];		// Z

	// Einen neuen Block auswählen
	self = this;
	var setBlock = function(block, blkColor)
	{
		var i = Math.floor(Math.random() * block.length);
		self.block = block[i];
		self.blkColor = blkColor[i];
	};

	setBlock(block, blkColor);
};


nsTetris.Spielstein.prototype.copy = function()
{
	var tmp = new nsTetris.Spielstein()
	tmp.block = this.block;
	tmp.blkColor = this.blkColor;
	return tmp;
};

// Stein um 90 Grad drehen
nsTetris.Spielstein.prototype.rotate = function()
{
	var newArray = [];
	var row = null;
	var yMax = this.block.length - 1;
	
	for (var x = 0; x < this.block[yMax].length; x++)
	{
		row = [];
		for (var y = yMax; y >= 0; y--)
		{
			row.push(this.block[y][x]);
		}
		
		newArray.push(row);
	}
	
	this.block = newArray;
};


/************************************ Klasse NextBlockField **************************************************/
nsTetris.NextBlockField = function(sizeX, sizeY, block)
{
	this.sizeX = sizeX;
	this.sizeY = sizeY;
	this.tGrid = [];
	this.block = block;
	this.bkColorTable = 'lightgrey';
	
	this.initField();
};

nsTetris.NextBlockField.prototype.initField = function()
{
	var playfield = null;
	var table = null;
	var tbody = null;
	var tr = null;
	var td = null;
	var row = null;
	
	tbody = document.createElement('tbody');
	for (var y = 0; y < this.sizeY; y++)
	{
		row = [];
		tr = document.createElement('tr');
		for (var x = 0; x < this.sizeX; x++)
		{
			td = document.createElement('td');
			tr.appendChild(td);
			row.push(td);
		}
		
		tbody.appendChild(tr);
		this.tGrid.push(row);
	}
	
	table = document.createElement('table');
	table.appendChild(tbody);
	
	playfield = document.getElementById("nextblock");
	if (playfield.firstChild == null)
		playfield.appendChild(table);
	else
		playfield.replaceChild(table, playfield.firstChild);

	// Block zeichen
	this.drawBlock();
};

nsTetris.NextBlockField.prototype.drawBlock = function()
{
	var ymax = this.tGrid.length;
	for (var y = 0; y < ymax; y++)
	{
		var xmax = this.tGrid[y].length;
		for (var x = 0; x < xmax; x++)
		{
			if (y < this.block.block.length && x < this.block.block[y].length && this.block.block[y][x])
				this.tGrid[y][x].style.backgroundColor = this.block.blkColor;
			else
				this.tGrid[y][x].style.backgroundColor = this.bkColorTable;
		}
	}
};


nsTetris.NextBlockField.prototype.setBlock = function(block)
{
	this.block = block;
};

/************************************ Klasse Spielfeld **************************************************/
nsTetris.Spielfeld = function(sizeX, sizeY)
{
	this.sizeX = sizeX;
	this.sizeY = sizeY;
	this.bkColorPlayground = 'white';
	this.speed = 500;
	this.playGrid = null;
	this.checkGrid = null;
	this.currBlockPos = [0, -1];
	this.currBlock = null;
	this.nextBlockField = null;
	
	this.initSpielfeld();

	var self = this;
	document.onkeypress = function(e)
	{
		var kc = getKeyCode(e);
		var newX = 0;
		var newY = 0;
		switch (kc)
		{
			case 38:	// hoch
				if (self.rotateable())
					self.rotate();
					
				break;
			
			case 37:	// links
				newX = self.currBlockPos[0] - 1;
				newY = self.currBlockPos[1];
				if (self.moveableLeft(self.currBlock, newX))
					self.moveBlock(newX, newY);

				break;
			
			case 39:	// rechts
				newX = self.currBlockPos[0] + 1;
				newY = self.currBlockPos[1];
				if (self.moveableRight(self.currBlock, newX))
					self.moveBlock(newX, newY);

				break;
			
			case 40:	// runter
				self.moveDownBlock();
				
				break;
		}
	};

	this.interval = window.setInterval(function() {self.moveDownBlock();}, this.speed);
};

nsTetris.Spielfeld.prototype.initSpielfeld = function()
{
	var self = null;
	this.currBlock = this.newBlock();
	this.currBlockPos[0] = Math.floor(this.sizeX / 2 - this.currBlock.block[0].length / 2)
	this.nextBlockField = new nsTetris.NextBlockField(5, 3, this.newBlock())

	document.getElementById("header").innerHTML = "Tetris a la Fraunz";
	document.getElementById("footer").innerHTML = 'Counter: <span id="counter">0</span>';
	document.getElementById("settings").innerHTML = "settings";
	
	var initPlayTable = function()
	{
		var playfield = null;
		var table = null;
		var tbody = null;
		var tr = null;
		var td = null;
		var row = null;
		var checkTr = null;

		self.playGrid = [];
		self.checkGrid = [];
		tbody = document.createElement('tbody');
		for (var y = 0; y < self.sizeY; y++)
		{
			row = [];
			checkTr = []
			tr = document.createElement('tr');
			for (var x = 0; x < self.sizeX; x++)
			{
				td = document.createElement('td');
				tr.appendChild(td);
				row.push(td);
				checkTr.push({occupied: false, color: self.bkColorPlayground});
			}
			
			tbody.appendChild(tr);
			self.playGrid.push(row);
			self.checkGrid.push(checkTr);
		}
		
		table = document.createElement('table');
		table.appendChild(tbody);
		
		playfield = document.getElementById("playfield");
		if (playfield.firstChild == null)
			playfield.appendChild(table);
		else
			playfield.replaceChild(table, playfield.firstChild);
	};
	
	self = this;
	initPlayTable();
};

nsTetris.Spielfeld.prototype.setBlockInTable = function(currX, currY)
{
	for (var y = this.currBlock.block.length - 1; y >= 0; y--)
	{
		if ((y + currY) < 0)
			break;

		for (var x = 0; x < this.currBlock.block[y].length; x++)
		{
			if (this.currBlock.block[y][x])
			{
				this.checkGrid[currY + y][currX + x] = {occupied: true, color: this.currBlock.blkColor};
			}
		}
	}
};

nsTetris.Spielfeld.prototype.deleteBlock = function()
{
	var cell = null;
	var currX = this.currBlockPos[0];
	var currY = this.currBlockPos[1];
	
	for (var y = this.currBlock.block.length - 1; y >= 0; y--)
	{
		if ((y + currY) < 0)
			break;

		for (var x = 0; x < this.currBlock.block[y].length; x++)
		{
			cell = this.checkGrid[currY + y][currX + x];
			if (!cell.occupied)
				this.playGrid[currY + y][currX + x].style.backgroundColor = this.bkColorPlayground;
		}
	}
};

nsTetris.Spielfeld.prototype.setBlock = function()
{
	var currX = this.currBlockPos[0];
	var currY = this.currBlockPos[1];
	
	for (var y = this.currBlock.block.length - 1; y >= 0; y--)
	{
		if ((y + currY) < 0)
			break;

		for (var x = 0; x < this.currBlock.block[y].length; x++)
		{
			if (this.currBlock.block[y][x])
				this.playGrid[currY + y][currX + x].style.backgroundColor = this.currBlock.blkColor;
			//else
				//this.playGrid[currY + y][currX + x].style.backgroundColor = this.bkColorPlayground;
		}
	}
};

nsTetris.Spielfeld.prototype.moveBlock = function(newX, newY)
{
	this.deleteBlock();
	this.currBlockPos = [newX, newY];
	this.setBlock();
};

nsTetris.Spielfeld.prototype.moveDownBlock = function()
{
	newX = this.currBlockPos[0];
	newY = this.currBlockPos[1] + 1;
	if (this.moveableDown(this.currBlock, newY))
		this.moveBlock(newX, newY);
	else
	{
		// Schauen ob man in der Tabelle schon oben ansteht
		if (newY <= 0)
		{
			// Game Over
			this.stopGame();
		}
		
		// Es geht nicht mehr weiter hinunter
		this.setBlockInTable(this.currBlockPos[0], this.currBlockPos[1]);
		this.fullRow();
		this.currBlock = this.nextBlockField.block;
		newY = -1;
		newX = Math.floor(this.sizeX / 2 - this.currBlock.block[0].length / 2)
		this.nextBlockField.setBlock(this.newBlock());
		this.nextBlockField.drawBlock();
		this.currBlockPos = [newX, newY];
	}
};

nsTetris.Spielfeld.prototype.moveableLeft = function(block, newX)
{
	var newY = this.currBlockPos[1];
	var cell = null;
	
	if (newX < 0)
		return false;
	
	if ((newY + block.block.length) >= this.sizeY)
		return false

	for (var y = block.block.length - 1; y >= 0; y--)
	{
		if ((newY + y) < 0)
			break;

		cell = this.checkGrid[newY + y][newX];
		if (block.block[y][0] && cell.occupied)
			return false;
	}
	
	return true;
};

nsTetris.Spielfeld.prototype.moveableRight = function(block, newX)
{
	var newY = this.currBlockPos[1];
	var cell = null;
	
	if (newX >= this.sizeX)
		return false;

	if ((newY + block.block.length) >= this.sizeY)
		return false

	for (var y = block.block.length - 1; y >= 0; y--)
	{
		var maxX = block.block[y].length - 1;
		if ((newX + maxX) >= this.sizeX)
			return false;

		if ((newY + y) < 0)
			break;

		cell = this.checkGrid[newY + y][newX + maxX];
		if (block.block[y][maxX] && cell.occupied)
			return false;
	}
	
	return true;
};

nsTetris.Spielfeld.prototype.moveableDown = function(block, newY)
{
	var cell = null;
	var currX = this.currBlockPos[0];
	
	if ((newY + block.block.length - 1) >= this.sizeY)
		return false;
	
	for (var y = block.block.length - 1; y >= 0; y--)
	{
		if ((y + newY) < 0)
			break;

		for (var x = 0; x < block.block[y].length; x++)
		{
			cell = this.checkGrid[newY + y][currX + x];
			if (block.block[y][x] && cell.occupied)
				return false;
		}
	}
	
	return true;
};

nsTetris.Spielfeld.prototype.rotate = function()
{
	this.deleteBlock();
	this.currBlock.rotate();
	this.setBlock();
};

nsTetris.Spielfeld.prototype.rotateable = function()
{
	var tmp = this.currBlock.copy();
	var cell = null;
	tmp.rotate();
	
	// linke Grenze
	if (!this.moveableLeft(tmp, this.currBlockPos[0]))
		return false;

	// rechte Grenze
	if (!this.moveableRight(tmp, this.currBlockPos[0]))
		return false;
		
	// untere Grenze
	if (!this.moveableDown(tmp, this.currBlockPos[1]))
		return false;

	//checkGrid
	return true;
};

nsTetris.Spielfeld.prototype.fullRow = function()
{
	var cell = null;
	var bRow = false;
	var redraw = false;
	var lines = 0;
	
	for (var y = 0; y < this.sizeY; y++)
	{
		bRow = true;
		for (var x = 0; x < this.sizeX; x++)
		{
			cell = this.checkGrid[y][x];
			if (!cell.occupied)
			{
				bRow = false;
				break;
			}
		}
		
		if (bRow)
		{
			// Eine volle Reihe ist vorhanden
			this.removeRow(y);
			redraw = true;
			lines++;
		}
	}
	
	if (redraw)
		this.redrawTable();
	
	if (lines > 0)
		this.updateCounter(lines * this.sizeX);
};

nsTetris.Spielfeld.prototype.removeRow = function(yRow)
{
	var row = [];
	
	// Die volle Zeile entfernen
	this.checkGrid.splice(yRow, 1)
	//Zeile am Anfang des Arrays hinzufügen
	for (x = 0; x < this.sizeX; x++)
		row.push({occupied: false, color: this.bkColorPlayground});
	
	this.checkGrid.unshift(row);
};


nsTetris.Spielfeld.prototype.newBlock = function()
{
	return new nsTetris.Spielstein();
};


nsTetris.Spielfeld.prototype.redrawTable = function()
{
	var cell = null;
	
	for (y = 0; y < this.sizeY; y++)
	{
		for(x = 0; x < this.sizeX; x++)
		{
			cell = this.checkGrid[y][x];
			this.playGrid[y][x].style.backgroundColor = cell.color;
		}
	}
};

nsTetris.Spielfeld.prototype.updateCounter = function(newValue)
{
	var counter = document.getElementById("counter").innerHTML * 1.0 + newValue;
	document.getElementById("counter").innerHTML = counter;
};

nsTetris.Spielfeld.prototype.stopGame = function()
{
	var table = null;
	var tbody = null;
	var tr = null;
	var td = null;
	var txt = null;
	var y = Math.floor(this.sizeY / 2);
	
	window.clearInterval(this.interval);
	document.onkeypress = null;

	table = document.getElementById("playfield").firstChild;
	tbody = table.firstChild;
	
	tr = document.createElement("tr");
	td = document.createElement("td");
	txt = document.createTextNode("GAME OVER");
	td.style.textAlign = "center";
	td.style.color = "black";
	td.appendChild(txt);
	td.style.backgroundColor = "red";
	td.colSpan = this.sizeX;
	tr.appendChild(td);
	tbody.replaceChild(tr, tbody.childNodes[12]);
};


function stopGame(playground)
{
	playground.stopGame();
}


function newGame()
{
	var playground = new nsTetris.Spielfeld(13, 25);
	document.getElementById("StopGame").removeEventListener("click", Function());
	document.getElementById("StopGame").addEventListener("click", function() {stopGame(playground);});
}

function onLoad()
{
	var playground = new nsTetris.Spielfeld(13, 25);
	document.getElementById("NewGame").addEventListener("click", newGame);
	document.getElementById("StopGame").addEventListener("click", function() {stopGame(playground);});
}

window.onload = onLoad;

























