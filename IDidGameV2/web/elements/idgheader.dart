import 'package:polymer/polymer.dart';
import 'dart:html';

/**
 * A Polymer click counter element.
 */
@CustomTag('idg-header')
class IDGHeader extends PolymerElement {
  @published String title = "";
  @published String subtitle = "";
  @published int type = 0;

  IDGHeader.created() : super.created() {
    Element iconElement=this.shadowRoot.querySelector("#icon");
    Element homeElement=this.shadowRoot.querySelector("#home");

    switch(type){
      case 0://games,...
        iconElement.hidden=true;
        break;
      case 1://home
        homeElement.hidden=true;
        break;
    }
  }
}

