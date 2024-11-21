class ActionEntity extends Entity {
  constructor(name, pos, size, rgba, world, actionTrigger, action) {
    super(name, pos, size, rgba, world);
    this.actionTrigger = actionTrigger;
    this.action = action;
    this.triggered = false;
  }

  render() {
    this.pos = vec2(this.originalPos.x+this.world.pos.x, this.originalPos.y+this.world.pos.y)
    drawRect(this.pos, this.size, this.rgba, 0);
  }

  update() {
    super.update();

    var triggerAction = false;

    if ( !this.triggered && this.actionTrigger == "collide" && this.collideTrigger() ) triggerAction = true;
    if ( !this.triggered && this.actionTrigger == "interact" && this.interactTrigger() ) triggerAction = true;
    // if ( !this.triggered && this.actionTrigger == "proximity" && this.proximityTrigger() ) triggerAction = true;

    if ( triggerAction ) {
      if ( this.action.prototype.constructor.name == "ItemPickupAction" ) {
        new this.action(this.world, this, this.name).trigger();
      }
      else {
        new this.action(this.world, this).trigger();
      }
    }
  }

  collideTrigger() {
    const collisionTypes = ["ControllerEntity"]
    for (var i=0; i<this.world.entities.length;i++) {
      var entityType = this.world.entities[i].constructor.name;
      var isAnotherEntity = this.world.entities[i] !== this;
      var isSupportedEntityType = collisionTypes.includes(entityType);
      var overlaps = isOverlapping(vec2(this.pos.x, this.pos.y), this.size, this.world.entities[i].pos, this.world.entities[i].size);

      if (isAnotherEntity && isSupportedEntityType && overlaps) {
        return true;
      }
    }

    return false;
  }

  interactTrigger() {
    return this.collideTrigger() && keyIsDown("KeyE")
  }
}
