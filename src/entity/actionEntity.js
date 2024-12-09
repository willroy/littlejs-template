class ActionEntity extends Entity {
  constructor(zindex, handle, pos, size, rgba, world, image, actionTrigger, action) {
    super(zindex, handle, pos, size, rgba, world, image);
    this.actionTrigger = actionTrigger;
    this.action = action;
    this.triggered = false;
    this.unTriggerOnRelease = false;

    this.animationSteps = [
      [0,0],
      [500,0],
      [1000,0],
      [1500,0]
    ]

    this.animationCount = 0;
    this.animationStep = 0;
    this.animationSpeed = 20;

    var animationStepXY = vec2(this.animationSteps[this.animationStep][0], this.animationSteps[this.animationStep][1]);
    this.interactimage = new SpriteSheetImage(animationStepXY, vec2(500, 500), this.pos, 1.5, images["interact"]);
  }

  render() {
    this.pos = vec2(this.originalPos.x+this.world.pos.x, this.originalPos.y+this.world.pos.y);

    if (debug && debugOverlay) drawRect(this.pos, this.size, this.rgba, 0);

    if ( this.image ) {
      this.image.pos = this.pos;
      this.image.render();
    }

    if ( this.interactimage ) {
      this.interactimage.pos = this.pos;
      this.interactimage.color = rgb(1,1,1,0.9)
      this.interactimage.render();
    }
  }

  update() {
    super.update();

    var triggerAction = false;

    if ( this.unTriggerOnRelease && !keyIsDown("KeyE") ) this.triggered = false;

    if ( !this.triggered && this.actionTrigger == "collide" && this.collideTrigger() ) triggerAction = true;
    if ( !this.triggered && this.actionTrigger == "interact" && this.interactTrigger() ) {
      console.log("Interacting with " + this.action.name)
      triggerAction = true;
    }
    // if ( !this.triggered && this.actionTrigger == "proximity" && this.proximityTrigger() ) triggerAction = true;

    if ( triggerAction ) new this.action(this).trigger();

    this.animationCount = this.animationCount + 1;
    if ( this.animationCount >= this.animationSpeed ) {
      this.animationCount = 0;
      if ( this.animationStep >= this.animationSteps.length ) { this.animationStep = 0 }

      var animationStepXY = vec2(this.animationSteps[this.animationStep][0], this.animationSteps[this.animationStep][1]);
      this.interactimage = new SpriteSheetImage(animationStepXY, vec2(500, 500), this.pos, 1, images["interact"]);
      this.animationStep = this.animationStep + 1;
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
