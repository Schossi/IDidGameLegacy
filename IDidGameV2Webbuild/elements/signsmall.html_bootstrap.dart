library app_bootstrap;

import 'package:polymer/polymer.dart';

import 'signsmall.dart' as i0;
import 'package:polymer/src/build/log_injector.dart';
import 'package:smoke/smoke.dart' show Declaration, PROPERTY, METHOD;
import 'package:smoke/static.dart' show useGeneratedCode, StaticConfiguration;
import 'signsmall.dart' as smoke_0;
import 'package:polymer/polymer.dart' as smoke_1;
import 'package:observe/src/metadata.dart' as smoke_2;
abstract class _M0 {} // PolymerElement & ChangeNotifier

void main() {
  useGeneratedCode(new StaticConfiguration(
      checkedMode: false,
      getters: {
        #hasIcon: (o) => o.hasIcon,
        #iconX: (o) => o.iconX,
        #iconY: (o) => o.iconY,
        #text: (o) => o.text,
      },
      setters: {
        #hasIcon: (o, v) { o.hasIcon = v; },
        #iconX: (o, v) { o.iconX = v; },
        #iconY: (o, v) { o.iconY = v; },
        #text: (o, v) { o.text = v; },
      },
      parents: {
        smoke_0.SignSmall: _M0,
        _M0: smoke_1.PolymerElement,
      },
      declarations: {
        smoke_0.SignSmall: {
          #hasIcon: const Declaration(#hasIcon, bool, kind: PROPERTY, annotations: const [smoke_1.published]),
          #iconX: const Declaration(#iconX, int, kind: PROPERTY, annotations: const [smoke_1.published]),
          #iconY: const Declaration(#iconY, int, kind: PROPERTY, annotations: const [smoke_1.published]),
          #text: const Declaration(#text, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
        },
      },
      names: {
        #hasIcon: r'hasIcon',
        #iconX: r'iconX',
        #iconY: r'iconY',
        #text: r'text',
      }));
  new LogInjector().injectLogsFromUrl('signsmall.html._buildLogs');
  configureForDeployment([
      () => Polymer.register('sign-small', i0.SignSmall),
    ]);
  i0.main();
}
