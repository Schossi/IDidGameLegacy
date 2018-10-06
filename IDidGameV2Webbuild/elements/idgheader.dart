import 'package:polymer/polymer.dart';
import 'dart:html';

/**
 * A Polymer click counter element.
 */
@CustomTag('idg-header')
class IDGHeader extends PolymerElement with ChangeNotifier  {
  @reflectable @published String get title => __$title; String __$title = ""; @reflectable set title(String value) { __$title = notifyPropertyChange(#title, __$title, value); }
  @reflectable @published String get subtitle => __$subtitle; String __$subtitle = ""; @reflectable set subtitle(String value) { __$subtitle = notifyPropertyChange(#subtitle, __$subtitle, value); }
  @reflectable @published int get type => __$type; int __$type = 0; @reflectable set type(int value) { __$type = notifyPropertyChange(#type, __$type, value); }

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

