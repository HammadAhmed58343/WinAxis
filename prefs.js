import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class WinAxisPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage();

        // 1. Shortcuts Group
        const shortcutsGroup = new Adw.PreferencesGroup({
            title: _('Keyboard Shortcuts'),
            description: _('Click a shortcut button to record a new key combination. Press Backspace/Delete to clear, or Escape to cancel.')
        });

        shortcutsGroup.add(this._createShortcutRow(
            _('Center Window'),
            _('Center active window while preserving dimensions'),
            'shortcut-center',
            settings
        ));

        shortcutsGroup.add(this._createShortcutRow(
            _('Center Right'),
            _('Move active window to center right while preserving dimensions'),
            'shortcut-center-right',
            settings
        ));

        shortcutsGroup.add(this._createShortcutRow(
            _('Scale & Center'),
            _('Resize active window and center it'),
            'shortcut-resize-center',
            settings
        ));

        page.add(shortcutsGroup);

        // 2. Resizing Options Group
        const sizingGroup = new Adw.PreferencesGroup({
            title: _('Resizing Options'),
            description: _('Configure target width and height when resizing the active window.')
        });

        // Target Width row
        const widthRow = new Adw.SpinRow({
            title: _('Target Width (%)'),
            subtitle: _('Percentage of the work area width'),
            adjustment: new Gtk.Adjustment({
                lower: 10,
                upper: 100,
                value: settings.get_int('resize-width'),
                step_increment: 1
            })
        });
        settings.bind(
            'resize-width',
            widthRow,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        sizingGroup.add(widthRow);

        // Target Height row
        const heightRow = new Adw.SpinRow({
            title: _('Target Height (%)'),
            subtitle: _('Percentage of the work area height'),
            adjustment: new Gtk.Adjustment({
                lower: 10,
                upper: 100,
                value: settings.get_int('resize-height'),
                step_increment: 1
            })
        });
        settings.bind(
            'resize-height',
            heightRow,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        sizingGroup.add(heightRow);

        page.add(sizingGroup);

        window.add(page);
    }

    _getShortcutLabel(shortcutStr) {
        if (!shortcutStr) return _('Disabled');
        const [ok, keyval, mask] = Gtk.accelerator_parse(shortcutStr);
        if (!ok) return shortcutStr;
        return Gtk.accelerator_get_label(keyval, mask) || shortcutStr;
    }

    _createShortcutRow(title, subtitle, schemaKey, settings) {
        const row = new Adw.ActionRow({
            title,
            subtitle
        });

        const box = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 6,
            valign: Gtk.Align.CENTER
        });

        const button = new Gtk.Button({
            valign: Gtk.Align.CENTER
        });

        const clearButton = new Gtk.Button({
            icon_name: 'edit-clear-symbolic',
            valign: Gtk.Align.CENTER,
            has_frame: false,
            tooltip_text: _('Disable shortcut')
        });

        let controller = null;

        const updateLabel = () => {
            const strv = settings.get_strv(schemaKey);
            const shortcut = strv.length > 0 ? strv[0] : '';
            button.set_label(this._getShortcutLabel(shortcut));
            clearButton.set_visible(!!shortcut);
        };

        const stopEditing = () => {
            if (controller) {
                button.remove_controller(controller);
                controller = null;
            }
            button.remove_css_class('suggested-action');
            updateLabel();
        };

        const startEditing = () => {
            if (controller) {
                stopEditing();
                return;
            }

            button.set_label(_('Press keys...'));
            button.add_css_class('suggested-action');

            controller = new Gtk.EventControllerKey();
            controller.set_propagation_phase(Gtk.PropagationPhase.CAPTURE);

            controller.connect('key-pressed', (_c, keyval, keycode, state) => {
                const mask = state & Gtk.accelerator_get_default_mod_mask();

                if (mask === 0 && keyval === Gdk.KEY_Escape) {
                    stopEditing();
                    return Gdk.EVENT_STOP;
                }

                if (mask === 0 && (keyval === Gdk.KEY_BackSpace || keyval === Gdk.KEY_Delete)) {
                    settings.set_strv(schemaKey, []);
                    stopEditing();
                    return Gdk.EVENT_STOP;
                }

                if (!Gtk.accelerator_valid(keyval, mask)) {
                    return Gdk.EVENT_PROPAGATE;
                }

                const shortcut = Gtk.accelerator_name_with_keycode(null, keyval, keycode, mask);
                if (shortcut) {
                    settings.set_strv(schemaKey, [shortcut]);
                }
                stopEditing();
                return Gdk.EVENT_STOP;
            });

            button.add_controller(controller);
            button.grab_focus();
        };

        button.connect('clicked', () => {
            startEditing();
        });

        clearButton.connect('clicked', () => {
            if (controller) stopEditing();
            settings.set_strv(schemaKey, []);
        });

        settings.connect(`changed::${schemaKey}`, () => {
            updateLabel();
        });

        updateLabel();

        box.append(button);
        box.append(clearButton);
        row.add_suffix(box);
        row.activatable_widget = button;

        return row;
    }
}
