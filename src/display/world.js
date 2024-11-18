class World {
  constructor(id) {
    this.id = id;
    this.pos = vec2(0,0);
    this.entities = this.loadEntities();

    // debug stuff

    this.debug_placedEntity = false;
  }

  loadEntities() {
    fetch('data/world'+this.id+'/entities.json')
    .then((response) => response.json())
    .then((json) => {
      this.createEntities(json);
    });
  }

  createEntities(json) {
    var newEntities = [];

    for ( var i = 0; i < json.length; i++ ) {
      const id = json[i].id;
      const type = json[i].type;
      const pos = json[i].pos;
      const size = json[i].size;
      const rgba = json[i].rgba;

      if ( json[i].type == "ControllerEntity" ) newEntities.push(new ControllerEntity(vec2(pos[0],pos[1]), vec2(size[0],size[1]), rgb(rgba[0],rgba[1],rgba[2],rgba[3]), this));
      else if ( json[i].type == "ObjectEntity" ) newEntities.push(new ObjectEntity(vec2(pos[0],pos[1]), vec2(size[0],size[1]), rgb(rgba[0],rgba[1],rgba[2],rgba[3]), this));
      else if ( json[i].type == "PhysicsObjectEntity" ) newEntities.push(new PhysicsObjectEntity(vec2(pos[0],pos[1]), vec2(size[0],size[1]), rgb(rgba[0],rgba[1],rgba[2],rgba[3]), this));
      else if ( json[i].type == "ActionEntity" ) {
        const actionTrigger = json[i].actionTrigger;
        const action = json[i].action;

        newEntities.push(new ActionEntity(vec2(pos[0],pos[1]), vec2(size[0],size[1]), rgb(rgba[0],rgba[1],rgba[2],rgba[3]), this, actionTrigger, action));
      }
    }

    this.entities = newEntities;
  }

  render() {
    for ( entity in this.entites ) { entity.render(); }
  }

  update() {
    for ( entity in this.entites ) { entity.update(); }

    // debug stuff

    if (debug && debugOverlay) {
      if (!keyIsDown("KeyI")) this.debug_placedEntity = false;
      
      for (var i = 0; i < this.entities.length; i++) {
        if (isOverlapping(mousePos, vec2(0.1,0.1), this.entities[i].pos, this.entities[i].size)) {
          if (mouseIsDown(0)) {
            this.entities[i].originalPos.x = mousePos.x-this.pos.x;
            this.entities[i].originalPos.y = mousePos.y-this.pos.y;
          } 
          else if (keyIsDown("KeyH")) this.entities[i].size.x = this.entities[i].size.x - 0.1;
          else if (keyIsDown("KeyJ")) this.entities[i].size.x = this.entities[i].size.x + 0.1;
          else if (keyIsDown("KeyV")) this.entities[i].size.y = this.entities[i].size.y - 0.1;
          else if (keyIsDown("KeyB")) this.entities[i].size.y = this.entities[i].size.y + 0.1;
          else if (keyIsDown("KeyO")) {
            this.entities[i].destroy();
            this.entities.splice(i, 1);
          }
        }
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
      const id = i;
      const type = this.entities[i].constructor.name;
      const pos = [this.entities[i].pos.x, this.entities[i].pos.y];
      const size = [this.entities[i].size.x, this.entities[i].size.y];
      const rgba = [this.entities[i].rgba.r, this.entities[i].rgba.g, this.entities[i].rgba.b, this.entities[i].rgba.a];

      if ( type == "ActionEntity" ) {
        const actionTrigger = this.entities[i].actionTrigger;
        const action = this.entities[i].action;
        entitiesList[i] = {"id": id, "type": type, "pos": pos, "size": size, "rgba": rgba, "actionTrigger": actionTrigger, "action": action}
      }
      else {
        entitiesList[i] = {"id": id, "type": type, "pos": pos, "size": size, "rgba": rgba}
      }
    }

    var entitiesJSON = JSON.stringify(entitiesList);

    var a = document.createElement("a");
    var file = new Blob([entitiesJSON], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = 'entities.json';
    a.click();
  }
}