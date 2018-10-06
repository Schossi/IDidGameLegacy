library app_bootstrap;

import 'package:polymer/polymer.dart';

import 'gamefooter.dart' as i0;
import 'package:polymer/src/build/log_injector.dart';
import 'package:smoke/smoke.dart' show Declaration, PROPERTY, METHOD;
import 'package:smoke/static.dart' show useGeneratedCode, StaticConfiguration;
import 'gamefooter.dart' as smoke_0;
import 'package:polymer/polymer.dart' as smoke_1;
import 'package:observe/src/metadata.dart' as smoke_2;
abstract class _M0 {} // PolymerElement & ChangeNotifier

void main() {
  useGeneratedCode(new StaticConfiguration(
      checkedMode: false,
      getters: {
        #tag: (o) => o.tag,
      },
      setters: {
        #tag: (o, v) { o.tag = v; },
      },
      parents: {
        smoke_0.GameFooter: _M0,
        _M0: smoke_1.PolymerElement,
      },
      declarations: {
        smoke_0.GameFooter: {
          #tag: const Declaration(#tag, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
        },
      },
      names: {
        #tag: r'tag',
      }));
  new LogInjector().injectLogsFromUrl('gamefooter.html._buildLogs');
  configureForDeployment([
      () => Polymer.register('game-footer', i0.GameFooter),
    ]);
  i0.main();
}
