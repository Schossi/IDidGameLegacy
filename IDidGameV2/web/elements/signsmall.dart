import 'package:polymer/polymer.dart';
import 'dart:html';

/**
 * A Polymer click counter element.
 */
@CustomTag('sign-small')
class SignSmall extends PolymerElement {
  @published String text = "init";

  @published
  bool get hasIcon => ihasIcon;
  set hasIcon(bool val) {
    ihasIcon = val;

    if (iconElement == null) {
      iconElement = this.$['iconDiv'];
    }

    if (iconElement != null) {
      iconElement.style.visibility = ihasIcon ? "visible" : "hidden";
      iconElement.style.width = ihasIcon ? "32px" : "0px";
      iconElement.style.height = ihasIcon ? "32px" : "0px";
    }
  }

  @published
  int get iconX => iiconX;
  set iconX(int val) {
    iiconX = val;

    if (iconElement == null) {
      iconElement = this.$['iconDiv'];
    }

    if (iconElement != null && iiconX!=null && iiconY!=null) {
      iconElement.style.backgroundPosition = (-iiconX).toString() + "px " + (-iiconY).toString() + "px";
    }
  }
  @published
  int get iconY => iiconY;
  set iconY(int val) {
    iiconY = val;

    if (iconElement == null) {
      iconElement = this.$['iconDiv'];
    }

    if (iconElement != null) {
      iconElement.style.backgroundPosition = (-iiconX).toString() + "px " + (-iiconY).toString() + "px";
    }
  }

  DivElement iconElement;

  bool ihasIcon = false;
  int iiconX = 0;
  int iiconY = 0;

  SignSmall.created() : super.created() {
    iconElement = this.$['iconDiv'];
  }
}
