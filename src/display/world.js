class World {
  constructor(id) {
    this.id = id;
    this.pos = vec2(0,0);
    this.frozen = false;
    this.entities = [];
    this.background = new SingleImage(5477, 5359, 0, 0, 80, 1);

    this.loadData();

    // debug stuff

    this.debug_placedEntity = false;  
    
    this.actions = {
      "DialogAction": DialogAction,
      "ItemPickupAction": ItemPickupAction
    }
  }

  reposition(xdiff, ydiff){
     if (this.frozen) return
      
     this.pos.x = this.pos.x + xdiff
     this.pos.y = this.pos.y + ydiff
  }

  loadData() {
    fetch('data/world'+this.id+'/entities.json')
    .then((response) => response.json())
    .then((json) => {
      this.createEntities(json);
    });
    fetch('data/world'+this.id+'/dialog.json')
    .then((response) => response.json())
    .then((json) => {
      this.dialog = json;
    });
    fetch('data/world'+this.id+'/items.json')
    .then((response) => response.json())
    .then((json) => {
      this.items = json;
    });
  }

  createEntities(json) {
    var newEntities = [];
    
    var jsonEntities = json.toSorted((a, b) => b.zindex - a.zindex);

    for ( var i = 0; i < jsonEntities.length; i++ ) {
      const ent = jsonEntities[i];
      const zindex = ent.zindex;
      const handle = ent.handle;
      const type = ent.type;
      const pos = vec2(ent.pos[0],ent.pos[1]);
      const size = vec2(ent.size[0],ent.size[1]);
      const rgba = rgb(ent.rgba[0],ent.rgba[1],ent.rgba[2],ent.rgba[3]);
      const world = this;

      if (handle) console.log("Building "+handle);

      if ( type == "ControllerEntity" ) newEntities.push( new ControllerEntity( zindex, handle, pos, size, rgba, world ) );
      else if ( type == "ObjectEntity" ) newEntities.push( new ObjectEntity( zindex, handle, pos, size, rgba, world ) );
      else if ( type == "PhysicsObjectEntity" ) newEntities.push( new PhysicsObjectEntity( zindex, handle, pos, size, rgba, world ) );
      else if ( type == "ActionEntity" ) {
        const actionTrigger = ent.actionTrigger;
        const action = this.actions[ent.action];

        newEntities.push( new ActionEntity( zindex, handle, pos, size, rgba, world, actionTrigger, action ) );
      }
    }

    this.entities = newEntities;
  }

  render() {  
    this.background.render();

    for ( entity in this.entites ) { entity.render(); }
  }

  update() {
    this.background.posX = this.pos.x;
    this.background.posY = this.pos.y;

    for ( entity in this.entites ) { entity.update(); }

    // debug stuff

    if (debug && debugOverlay) {
      if (!keyIsDown("KeyI")) this.debug_placedEntity = false;

      var closestObject = null;
      let bestDistance = Infinity;

      for (var i = 0; i < this.entities.length; i++) {
        const distance = mousePos.distanceSquared(this.entities[i].pos);
        if (distance < bestDistance) {
            bestDistance = distance;
            closestObject = this.entities[i];
        }
      }

      if ( closestObject == null ) return;

      if (mouseIsDown(0)) {
        closestObject.originalPos.x = mousePos.x-this.pos.x;
        closestObject.originalPos.y = mousePos.y-this.pos.y;
      } 
      else if (keyIsDown("KeyH")) closestObject.size.x = closestObject.size.x - 0.1;
      else if (keyIsDown("KeyJ")) closestObject.size.x = closestObject.size.x + 0.1;
      else if (keyIsDown("KeyV")) closestObject.size.y = closestObject.size.y - 0.1;
      else if (keyIsDown("KeyB")) closestObject.size.y = closestObject.size.y + 0.1;
      else if (keyIsDown("KeyO")) {
        closestObject.destroy();
        this.entities.splice(closestObject.id, 1);
      }
      if (keyIsDown("KeyI") && !this.debug_placedEntity) {
        this.debug_placedEntity = true;
        this.entities.push(new ObjectEntity(vec2(mousePos.x-this.pos.x, mousePos.y-this.pos.y), vec2(1,1), rgb(0,0,0,1), this));
      }
    }
  }

  uploadJSON(jsonString) {
    var json = JSON.parse(jsonString);

    for ( var i = 0; i < this.entities.length; i++ ) {
      this.entities[i].destroy();
    }

    this.entities = [];

    this.createEntities(json);
  }

  downloadJSON() {
    var entitiesList = [];

    for ( var i = 0; i < this.entities.length; i++ ) {
      const ent = this.entities[i];
      const zindex = ent.zindex;
      const handle = ent.handle;
      const type = ent.constructor.name;
      const pos = [ent.originalPos.x,ent.originalPos.y];
      const size = [ent.size.x,ent.size.y];
      const rgba = [ent.rgba.r,ent.rgba.g,ent.rgba.b,ent.rgba.a];

      if ( type == "ActionEntity" ) {
        const actionTrigger = this.entities[i].actionTrigger;
        const action = this.entities[i].action.prototype.constructor.name;

        entitiesList[i] = {"zindex": zindex, "handle": handle, "type": type, "pos": pos, "size": size, "rgba": rgba, "actionTrigger": actionTrigger, "action": action}
      }
      else {
        entitiesList[i] = {"zindex": zindex, "handle": handle, "type": type, "pos": pos, "size": size, "rgba": rgba}
      }
    }

    var entitiesJSON = JSON.stringify(entitiesList);

    var a = document.createElement("a");
    var file = new Blob([entitiesJSON], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = 'entities.json';
    a.click();
  }

  getEntityByHandle(handle) {
    for ( var i = 0; i < this.entities.length; i++ ) {
      if ( this.entities[i].handle === handle ) {
        return this.entities[i];
      }
    }
  }
}
