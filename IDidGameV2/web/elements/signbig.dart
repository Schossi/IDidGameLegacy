import 'package:polymer/polymer.dart';
import 'dart:html';

/**
 * A Polymer click counter element.
 */
@CustomTag('sign-big')
class SignBig extends PolymerElement {
  @published String title = "";

  SignBig.created() : super.created() {
  }
}

