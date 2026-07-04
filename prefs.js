import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class WindowCentererPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        // Create a preferences page and group
        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({
            title: _('Resizing Options'),
            description: _('Configure target width and height when resizing the active window.')
        });
        page.add(group);

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
        group.add(widthRow);

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
        group.add(heightRow);

        window.add(page);
    }
}
