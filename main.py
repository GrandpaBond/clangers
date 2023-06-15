def makeVox(Flo: number, Frise: number, Fhi: number, Ffall: number, VLo: number, Vrise: number, Vhi: number, Vfall: number, Period: number):
    pass

def on_button_pressed_a():
    basic.show_icon(IconNames.SAD)
    music.play(uhOh1, music.PlaybackMode.UNTIL_DONE)
    basic.pause(200)
    music.play(uhOh2, music.PlaybackMode.UNTIL_DONE)
    music.play(uhOh3, music.PlaybackMode.UNTIL_DONE)
input.on_button_pressed(Button.A, on_button_pressed_a)

def prepare():
    global freq
    freq = 100
    pins.analog_write_pin(AnalogPin.P0, 1023)
    pins.analog_write_pin(AnalogPin.P1, 1023)
    pins.analog_write_pin(AnalogPin.P2, 1023)
    pins.analog_set_period(AnalogPin.P0, 500)
    pins.analog_set_period(AnalogPin.P1, 750)
    pins.analog_set_period(AnalogPin.P2, 1000)
def voxUhOh(pitch: number, ms: number):
    pass

def on_button_pressed_b():
    global freq
    freq = freq / 2
input.on_button_pressed(Button.B, on_button_pressed_b)

freq = 0
uhOh3: SoundExpression = None
uhOh2: SoundExpression = None
uhOh1: SoundExpression = None
music.set_built_in_speaker_enabled(False)
uhOh1 = music.create_sound_expression(WaveShape.SQUARE,
    262,
    370,
    62,
    255,
    220,
    SoundExpressionEffect.NONE,
    InterpolationCurve.LINEAR)
uhOh2 = music.create_sound_expression(WaveShape.SQUARE,
    311,
    262,
    150,
    137,
    150,
    SoundExpressionEffect.NONE,
    InterpolationCurve.LINEAR)
uhOh3 = music.create_sound_expression(WaveShape.SQUARE,
    262,
    277,
    150,
    137,
    200,
    SoundExpressionEffect.NONE,
    InterpolationCurve.LINEAR)

def on_forever():
    pass
basic.forever(on_forever)
