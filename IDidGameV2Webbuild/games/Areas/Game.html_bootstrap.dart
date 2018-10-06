library app_bootstrap;

import 'package:polymer/polymer.dart';

import '../../elements/idgheader.dart' as i0;
import 'package:polymer/src/build/log_injector.dart';
import '../../elements/gamefooter.dart' as i1;
import 'package:polymer/src/build/log_injector.dart';
import 'Game.html.0.dart' as i2;
import 'package:polymer/src/build/log_injector.dart';
import 'package:smoke/smoke.dart' show Declaration, PROPERTY, METHOD;
import 'package:smoke/static.dart' show useGeneratedCode, StaticConfiguration;
import '../../elements/idgheader.dart' as smoke_0;
import 'package:polymer/polymer.dart' as smoke_1;
import 'package:observe/src/metadata.dart' as smoke_2;
import '../../elements/gamefooter.dart' as smoke_3;
abstract class _M0 {} // PolymerElement & ChangeNotifier

void main() {
  useGeneratedCode(new StaticConfiguration(
      checkedMode: false,
      getters: {
        #subtitle: (o) => o.subtitle,
        #tag: (o) => o.tag,
        #title: (o) => o.title,
        #type: (o) => o.type,
      },
      setters: {
        #subtitle: (o, v) { o.subtitle = v; },
        #tag: (o, v) { o.tag = v; },
        #title: (o, v) { o.title = v; },
        #type: (o, v) { o.type = v; },
      },
      parents: {
        smoke_3.GameFooter: _M0,
        smoke_0.IDGHeader: _M0,
        _M0: smoke_1.PolymerElement,
      },
      declarations: {
        smoke_3.GameFooter: {
          #tag: const Declaration(#tag, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
        },
        smoke_0.IDGHeader: {
          #subtitle: const Declaration(#subtitle, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #title: const Declaration(#title, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #type: const Declaration(#type, int, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
        },
      },
      names: {
        #subtitle: r'subtitle',
        #tag: r'tag',
        #title: r'title',
        #type: r'type',
      }));
  new LogInjector().injectLogsFromUrl('Game.html._buildLogs');
  configureForDeployment([
      () => Polymer.register('idg-header', i0.IDGHeader),
      () => Polymer.register('game-footer', i1.GameFooter),
    ]);
  i2.main();
}
