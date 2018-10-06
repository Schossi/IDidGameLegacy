library app_bootstrap;

import 'package:polymer/polymer.dart';

import 'signbig.dart' as i0;
import 'package:polymer/src/build/log_injector.dart';
import 'package:smoke/smoke.dart' show Declaration, PROPERTY, METHOD;
import 'package:smoke/static.dart' show useGeneratedCode, StaticConfiguration;
import 'signbig.dart' as smoke_0;
import 'package:polymer/polymer.dart' as smoke_1;
import 'package:observe/src/metadata.dart' as smoke_2;
abstract class _M0 {} // PolymerElement & ChangeNotifier

void main() {
  useGeneratedCode(new StaticConfiguration(
      checkedMode: false,
      getters: {
        #title: (o) => o.title,
      },
      setters: {
        #title: (o, v) { o.title = v; },
      },
      parents: {
        smoke_0.SignBig: _M0,
        _M0: smoke_1.PolymerElement,
      },
      declarations: {
        smoke_0.SignBig: {
          #title: const Declaration(#title, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
        },
      },
      names: {
        #title: r'title',
      }));
  new LogInjector().injectLogsFromUrl('signbig.html._buildLogs');
  configureForDeployment([
      () => Polymer.register('sign-big', i0.SignBig),
    ]);
  i0.main();
}
