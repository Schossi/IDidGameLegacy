library app_bootstrap;

import 'package:polymer/polymer.dart';

import 'elements/signsmall.dart' as i0;
import 'package:polymer/src/build/log_injector.dart';
import 'elements/pathhorizontal.dart' as i1;
import 'package:polymer/src/build/log_injector.dart';
import 'elements/gamebutton.dart' as i2;
import 'package:polymer/src/build/log_injector.dart';
import 'elements/idgheader.dart' as i3;
import 'package:polymer/src/build/log_injector.dart';
import 'elements/signbig.dart' as i4;
import 'package:polymer/src/build/log_injector.dart';
import 'index.html.0.dart' as i5;
import 'package:polymer/src/build/log_injector.dart';
import 'package:smoke/smoke.dart' show Declaration, PROPERTY, METHOD;
import 'package:smoke/static.dart' show useGeneratedCode, StaticConfiguration;
import 'elements/signsmall.dart' as smoke_0;
import 'package:polymer/polymer.dart' as smoke_1;
import 'package:observe/src/metadata.dart' as smoke_2;
import 'elements/pathhorizontal.dart' as smoke_3;
import 'elements/gamebutton.dart' as smoke_4;
import 'elements/idgheader.dart' as smoke_5;
import 'elements/signbig.dart' as smoke_6;
abstract class _M0 {} // PolymerElement & ChangeNotifier

void main() {
  useGeneratedCode(new StaticConfiguration(
      checkedMode: false,
      getters: {
        #clicked: (o) => o.clicked,
        #description: (o) => o.description,
        #hasIcon: (o) => o.hasIcon,
        #icon: (o) => o.icon,
        #iconX: (o) => o.iconX,
        #iconY: (o) => o.iconY,
        #instanceCondition: (o) => o.instanceCondition,
        #instanceScoreText: (o) => o.instanceScoreText,
        #name: (o) => o.name,
        #path: (o) => o.path,
        #subtitle: (o) => o.subtitle,
        #tag: (o) => o.tag,
        #text: (o) => o.text,
        #title: (o) => o.title,
        #type: (o) => o.type,
      },
      setters: {
        #description: (o, v) { o.description = v; },
        #hasIcon: (o, v) { o.hasIcon = v; },
        #icon: (o, v) { o.icon = v; },
        #iconX: (o, v) { o.iconX = v; },
        #iconY: (o, v) { o.iconY = v; },
        #instanceCondition: (o, v) { o.instanceCondition = v; },
        #instanceScoreText: (o, v) { o.instanceScoreText = v; },
        #name: (o, v) { o.name = v; },
        #path: (o, v) { o.path = v; },
        #subtitle: (o, v) { o.subtitle = v; },
        #tag: (o, v) { o.tag = v; },
        #text: (o, v) { o.text = v; },
        #title: (o, v) { o.title = v; },
        #type: (o, v) { o.type = v; },
      },
      parents: {
        smoke_4.GameButton: _M0,
        smoke_5.IDGHeader: _M0,
        smoke_3.PathHorizontal: _M0,
        smoke_6.SignBig: _M0,
        smoke_0.SignSmall: _M0,
        _M0: smoke_1.PolymerElement,
      },
      declarations: {
        smoke_4.GameButton: {
          #description: const Declaration(#description, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #icon: const Declaration(#icon, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #name: const Declaration(#name, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #path: const Declaration(#path, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
        },
        smoke_5.IDGHeader: {
          #subtitle: const Declaration(#subtitle, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #title: const Declaration(#title, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
          #type: const Declaration(#type, int, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
        },
        smoke_3.PathHorizontal: {
          #instanceCondition: const Declaration(#instanceCondition, smoke_3.WinCondition, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_2.observable]),
          #instanceScoreText: const Declaration(#instanceScoreText, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_2.observable]),
          #tag: const Declaration(#tag, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
        },
        smoke_6.SignBig: {
          #title: const Declaration(#title, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
        },
        smoke_0.SignSmall: {
          #hasIcon: const Declaration(#hasIcon, bool, kind: PROPERTY, annotations: const [smoke_1.published]),
          #iconX: const Declaration(#iconX, int, kind: PROPERTY, annotations: const [smoke_1.published]),
          #iconY: const Declaration(#iconY, int, kind: PROPERTY, annotations: const [smoke_1.published]),
          #text: const Declaration(#text, String, kind: PROPERTY, annotations: const [smoke_2.reflectable, smoke_1.published]),
        },
      },
      names: {
        #clicked: r'clicked',
        #description: r'description',
        #hasIcon: r'hasIcon',
        #icon: r'icon',
        #iconX: r'iconX',
        #iconY: r'iconY',
        #instanceCondition: r'instanceCondition',
        #instanceScoreText: r'instanceScoreText',
        #name: r'name',
        #path: r'path',
        #subtitle: r'subtitle',
        #tag: r'tag',
        #text: r'text',
        #title: r'title',
        #type: r'type',
      }));
  new LogInjector().injectLogsFromUrl('index.html._buildLogs');
  configureForDeployment([
      () => Polymer.register('sign-small', i0.SignSmall),
      () => Polymer.register('path-horizontal', i1.PathHorizontal),
      () => Polymer.register('game-button', i2.GameButton),
      () => Polymer.register('idg-header', i3.IDGHeader),
      () => Polymer.register('sign-big', i4.SignBig),
    ]);
  i5.main();
}
