class ShedKeyAction {
  constructor(triggerEntity) {
    this.triggerEntity = triggerEntity;
    this.world = triggerEntity.world;
  }

  trigger() {
    var dialogAction = new DialogAction(this.triggerEntity);
    var player = this.world.getEntityByHandle(this.world.player);

    console.log("TRIGGERED")

    this.triggerEntity.triggered = true;
    if (gameVariables["shedEmpty"]){
      console.log("Shed is empty dialog")
      dialogAction.dialogHandle = "shed-empty";
      dialogAction.unTriggerOnRelease = true;
      dialogAction.trigger();
    }
    else if (gameVariables["shedKeyUsed"] || (player.inventory.includes("shedkey") && player.inventory.indexOf("shedkey") == player.inventoryPos) ) {
      this.triggerEntity.unTriggerOnRelease = true;
      console.log("Open the door")
      this.triggerEntity.world.frozen = true;
      gameVariables["shedKeyUsed"] = true
      player.inventory.splice(player.inventory.indexOf("shedkey"), 1);
      display.loadedUI = new ShedUI(this.triggerEntity);
    }
    else if ( player.inventory.includes("shedkey") ) {
      dialogAction.dialogHandle = "shed-locked-haveKey";
      dialogAction.unTriggerOnRelease = true;
      dialogAction.trigger();
    }
    else {
      dialogAction.dialogHandle = "shed-locked";
      dialogAction.unTriggerOnRelease = true;
      dialogAction.trigger();
    }
  }
}
