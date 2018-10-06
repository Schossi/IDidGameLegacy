library app_bootstrap;

import 'package:polymer/polymer.dart';

import 'gamebutton.dart' as i0;
import 'package:polymer/src/build/log_injector.dart';
import 'package:smoke/smoke.dart' show Declaration, PROPERTY, METHOD;
import 'package:smoke/static.dart' show useGeneratedCode, StaticConfiguration;
import 'gamebutton.dart' as smoke_0;
import 'package:polymer/polymer.dart' as smoke_1;
import 'package:observe/src/metadata.dart' as smoke_2;
abstract class _M0 {} // PolymerElement & ChangeNotifier

void main() {
  useGeneratedCode(new StaticConfiguration(
      checkedMode: false,
      getters: {
        #clicked: (o) => o.clicked,
        #description: (o) => o.description,
        #icon: (o) => o.icon,
        #name: (o) => o.name,
        #path: (o) => o.path,
      },
      setters: {
        #description: (o, v) { o.description = v; },
        #icon: (o, v) { o.icon = v; },
        #name: (o, v) { o.name = v; },
        #path: (o, v) { o.path = v; },
      },
      parents: {
        smoke_0.GameButton: _M0,
        _M0: smoke_1.PolymerElement,
      },
      declarations: {
        smoke_0.GameButton: {
          #description: const Declaration(#description, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #icon: const Declaration(#icon, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #name: const Declaration(#name, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #path: const Declaration(#path, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
        },
      },
      names: {
        #clicked: r'clicked',
        #description: r'description',
        #icon: r'icon',
        #name: r'name',
        #path: r'path',
      }));
  new LogInjector().injectLogsFromUrl('gamebutton.html._buildLogs');
  configureForDeployment([
      () => Polymer.register('game-button', i0.GameButton),
    ]);
  i0.main();
}
