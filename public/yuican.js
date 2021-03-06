var createCanvas = function(id, top, left, socket, tit){
YUI().use('node','gallery-canvas','dd-drag','resize', function(Y)
{
	var container = Y.Node.create('<div id="container_'+ id +'" class="container" width=400px height=300px style="position:absolute;top:'+top+'%;left:'+left+'%">');
	var title = Y.Node.create('<div id="title_'+ id +'" class="title" style="background:rgba(10,10,10,0.8);position:relative;top:0%;left:0%;width:101%;height:13%;z-index:10">'+ tit +'</div>');
	var close = Y.Node.create('<div id="close_'+ id +'" class="close" style="position:relative;top:0%;left:90%;width:11%;height:13%;z-index:11;cursor:pointer"><img src="close.png" style="width:70%;height:70%"/></div>');
	
	var canvas = Y.Node.create('<canvas id="canvas_' + id + '" class="imageView"></canvas>');
	title.appendChild(close);
	container.appendChild(title);
	container.appendChild(canvas);
	Y.one('body').appendChild(container);
 
	var context = new Y.Canvas.Context2d(canvas);

	var isDrawing = false;
	var x, y;

	canvas.on('mousedown', function (e) {
		x = e.clientX - canvas.getX();
		y = e.clientY - canvas.getY();
		isDrawing = true;

		context.beginPath();
	});

	var stop = function (e) {
		isDrawing = false;

		context.stroke();
	};
		

	canvas.on('mousemove',function (e) {
		if(isDrawing)
		{
			context.moveTo(x,y);
			x = e.clientX - canvas.getX();
			y = e.clientY - canvas.getY();
			context.lineTo(x,y);
			context.stroke();
		}
	});

	canvas.on('mouseout', stop);
	canvas.on('mouseup', stop);

	//Drag
	var dd = new Y.DD.Drag({
        	node: '#container_'+id
    		}).addHandle('#title_'+id);

	//Resize
	var resize = new Y.Resize({
        node: '#container_'+id
    })

    if(socket)
    {

    	//Socket Emits

    	//Drag
    	dd.on('drag:drag',function() {
    		var mvvm = {'type':'move', 'id':id, 'content':{'x':container.getX(),'y':container.getY()} };
    		socket.emit('updateView', mvvm);
    	});

    	//Resize
    	resize.on('resize:end', function() {
    		var mvvm = {'type':'resize', 'id':id, 'content':{'height':document.getElementById('container_'+id).style.height, 'width':document.getElementById('container_'+id).style.width} };
    		socket.emit('updateView', mvvm);
    	});

    	//Draw
    	canvas.on('mousemove',function (e) {
		if(isDrawing)
		{
			var mvvm = {'type':'draw', 'id':id, 'content':{'x':e.clientX - canvas.getX(),'y':e.clientY - canvas.getY()} };
    		socket.emit('updateView', mvvm);
		}
	});
    	canvas.on('mouseup', function (e) {
    		socket.emit('updateView',{'type':'drawRelease', 'id':id, 'content':{} });
    	});

	//close
	close.on("click",function(e){
		document.getElementById('container_'+id).style.display="none";
		socket.emit("updateView",{'type':"closecont",'id':id});
	});
    }
 
});
}
