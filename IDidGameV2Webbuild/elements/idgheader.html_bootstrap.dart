library app_bootstrap;

import 'package:polymer/polymer.dart';

import 'idgheader.dart' as i0;
import 'package:polymer/src/build/log_injector.dart';
import 'package:smoke/smoke.dart' show Declaration, PROPERTY, METHOD;
import 'package:smoke/static.dart' show useGeneratedCode, StaticConfiguration;
import 'idgheader.dart' as smoke_0;
import 'package:polymer/polymer.dart' as smoke_1;
import 'package:observe/src/metadata.dart' as smoke_2;
abstract class _M0 {} // PolymerElement & ChangeNotifier

void main() {
  useGeneratedCode(new StaticConfiguration(
      checkedMode: false,
      getters: {
        #subtitle: (o) => o.subtitle,
        #title: (o) => o.title,
        #type: (o) => o.type,
      },
      setters: {
        #subtitle: (o, v) { o.subtitle = v; },
        #title: (o, v) { o.title = v; },
        #type: (o, v) { o.type = v; },
      },
      parents: {
        smoke_0.IDGHeader: _M0,
        _M0: smoke_1.PolymerElement,
      },
      declarations: {
        smoke_0.IDGHeader: {
          #subtitle: const Declaration(#subtitle, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #title: const Declaration(#title, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #type: const Declaration(#type, int, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
        },
      },
      names: {
        #subtitle: r'subtitle',
        #title: r'title',
        #type: r'type',
      }));
  new LogInjector().injectLogsFromUrl('idgheader.html._buildLogs');
  configureForDeployment([
      () => Polymer.register('idg-header', i0.IDGHeader),
    ]);
  i0.main();
}
