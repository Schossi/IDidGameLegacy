import 'package:polymer/polymer.dart';
import 'dart:html';

/**
 * A Polymer click counter element.
 */
@CustomTag('sign-big')
class SignBig extends PolymerElement with ChangeNotifier  {
  @reflectable @published String get title => __$title; String __$title = ""; @reflectable set title(String value) { __$title = notifyPropertyChange(#title, __$title, value); }

  SignBig.created() : super.created() {
  }
}

