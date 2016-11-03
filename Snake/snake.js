

function getKeyCode(ev)
{
	if (!ev)
		ev = window.event;

	if ((typeof(ev.which) == "undefined" || (typeof(ev.which) == "number" && ev.which == 0)) && typeof(ev.keyCode) == "number")
		return ev.keyCode;
	else	
		return ev.which;
}


function Snake(snakePos)
{
	this.snake = snakePos;
	this.colorHead = "#0033CC";
	this.colorBody = "#0099FF";
	this.colorCrash = "#800000";
	this.interval = null;
	this.speed = 200;
	// 1 = nach rechts; -1 = nach links
	this.dirX = 1;
	// 1 = nach unten; -1 = nach oben
	this.dirY = 0;
	// festhalten ob eine Taste bereits gedrückt wurde
	this.keyPressed = false;
	
	this.length = function()
	{
		return this.snake.length;
	};
	
	this.initSnake = function()
	{
		for(var i = 0; i < this.length(); i++)
			if (i == 0)
				this.snake[i].style.backgroundColor = this.colorHead;
			else
				this.snake[i].style.backgroundColor = this.colorBody;
	};
	
	this.detectCollision = function(cell)
	{
		for (var i = 0; i < this.length(); i++)
		{
			if (this.snake[i] == cell)
				return true;
		}
		
		return false;
	};
	
	this.moveTo = function(cell, isMeat)
	{
		var collision = this.detectCollision(cell);
		if (collision)
		{
			window.clearInterval(this.interval);
			for (var i = 0; i < this.length(); i++)
				this.snake[i].style.backgroundColor = this.colorCrash;
			
			return;
		}

		var newSnakePos = [];
		newSnakePos.push(cell);
		for (var i = 0; i < this.length(); i++)
		{
			this.snake[i].style.backgroundColor = this.colorBody;
			if (i < (this.length() - 1))
				newSnakePos.push(this.snake[i]);
			else if (i == (this.length() - 1) && isMeat)
				newSnakePos.push(this.snake[i]);
			else
				this.snake[i].style.backgroundColor = 'lightgrey';
		}
		
		cell.style.backgroundColor = this.colorHead;
		this.snake = newSnakePos;
		this.isKeyPressed = false;
	};
	
	var self = this;
	document.onkeydown = function(e)
	{
		var kc = 0;
		if (self.isKeyPressed)
			return;

		kc = window.getKeyCode(e);
		// links
		if ((kc == 37 || kc == 65) && self.dirX == 0)
		{
			self.dirX = -1;
			self.dirY = 0;
		}
		// hoch
		else if ((kc == 38 || kc == 87) && self.dirY == 0)
		{
			self.dirX = 0;
			self.dirY = -1;
		}
		//rechts
		else if ((kc == 39 || kc == 68) && self.dirX == 0)
		{
			self.dirX = 1;
			self.dirY = 0;
		}
		//runter
		else if ((kc == 40 || kc == 83) && self.dirY == 0)
		{
			self.dirX = 0;
			self.dirY = 1;
		}
		
		self.isKeyPressed = true;
	};
	
	this.initSnake();
}

function SnakeMeat(cell)
{
	this.meat = cell;
	this.meatColor = "#003300";
	
	this.meat.style.backgroundColor = this.meatColor;
}

function Playground(size)
{
	this.size = size;
	this.playGrid = [];
	this.table = null;
	this.snake = null;
	this.snakemeat = null;
	this.snakePosX = 1;
	this.snakePosY = 1;
	this.counter = 0;
	
	this.initPlayground = function()
	{
		var table = document.createElement("table");
		var tbody = document.createElement("tbody");
		var thead = document.createElement("thead");
		var tfoot = document.createElement("tfoot");

		// Table Header
		var tr = document.createElement("tr");
		var th = document.createElement("th");
		th.colSpan = this.size;
		var thText = document.createTextNode("SNAKE a la Fraunz");
		th.appendChild(thText);
		tr.appendChild(th);
		thead.appendChild(tr);
		
		// Table Body
		for (var i = 0; i < this.size; i++)
		{
			tr = document.createElement("tr");
			var row = [];
			for (var j = 0; j < this.size; j++)
			{
				var td = document.createElement("td");
				tr.appendChild(td);
				row.push(td);
			}
			
			tbody.appendChild(tr);
			this.playGrid.push(row);
		}

		// Table Footer
		tr = document.createElement("tr");
		var td = document.createElement("td");
		td.colSpan = this.size;
		var tdText = document.createTextNode("Counter:" + this.counter);
		td.appendChild(tdText);
		tr.appendChild(td);
		tfoot.appendChild(tr);
		
		// Tabelle zusammenfügen
		table.appendChild(thead);
		table.appendChild(tbody);
		table.appendChild(tfoot);
		
		return table;
	};
	
	this.initSnake = function()
	{
		// Die Schlange im playGrid setzen
		this.snakePosX = 1;
		this.snakePosY = 1;
		var snakePos = [ this.playGrid[1][1], this.playGrid[2][1], this.playGrid[3][1] ];
		this.snake = new Snake(snakePos);

		this.snake.interval = window.setInterval(function() { self.moveSnake(); }, this.snake.speed);
	};
	
	this.stopGame = function()
	{
		window.clearInterval(this.snake.interval);
	};
	
	this.setSnakeMeat = function()
	{
		var x = Math.floor(Math.random() * this.size);
		var y = Math.floor(Math.random() * this.size);
		
		this.snakemeat = new SnakeMeat(this.playGrid[y][x]);
	};
	
	this.updateCounter = function()
	{
		this.counter++;
		var footer = document.getElementsByTagName("tfoot")[0];
		var tr = footer.firstChild;
		var td = tr.firstChild;
		td.innerHTML = "Counter: " + this.counter;
	}
	
	
	this.moveSnake = function()
	{
		var isMeat = false;
		var x = this.snakePosX + this.snake.dirX;
		var y = this.snakePosY + this.snake.dirY;
		
		if (x < 0)
			x = this.size - 1;
		
		if (x > (this.size - 1))
			x = 0;
		
		if (y < 0)
			y = this.size - 1;
		
		if (y > (this.size - 1))
			y = 0;
		
		this.snakePosX = x;
		this.snakePosY = y;
		var cell = this.playGrid[y][x];
		if (cell == this.snakemeat.meat)
			isMeat = true;

		this.snake.moveTo(cell, isMeat);
		if (isMeat)
		{
			this.updateCounter();
			this.setSnakeMeat();
		}
		else
			this.snakemeat.meat.style.backgroundColor = this.snakemeat.meatColor;
	};
	
	
	var self = this;
	this.table = this.initPlayground();
	this.initSnake();
	this.setSnakeMeat();
	
	var playground = document.getElementById("playground");
	//playground.appendChild(this.table);
	playground.replaceChild(this.table, playground.firstChild);
}


function stopGame(playground)
{
	playground.stopGame();
}


function newGame()
{
	var playground = new Playground(14);
	document.getElementById("StopGame").removeEventListener("click", Function());
	document.getElementById("StopGame").addEventListener("click", function() {stopGame(playground);});
}


function onLoad()
{
	var playground = new Playground(14);
	document.getElementById("NewGame").addEventListener("click", newGame);
	document.getElementById("StopGame").addEventListener("click", function() {stopGame(playground);});
}


window.onload = onLoad;
