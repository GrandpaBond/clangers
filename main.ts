enum VoxType {
    NONE = 0,
    TWEET = 1,
    LAUGH = 2,
    SNORE = 3,
    DOO = 4,
    QUERY = 5,
    UHOH = 6,
    MOAN = 7,
    DUH = 8,
    WAAH = 9,
    GROWL = 10
}
function prepareVoices(){

}

class Utterance {
//properties
    name: string = "";
    start: string = "";
    middle: string = "";
    end: string = "";
    freqFactor: number[4];
    volFactor: number[4];
    timeFactor: number[3];
//methods 
    utterUsing(freq,vol,ms){
        
    }

    }


}
let laugh = new Utterance();
let snore = new Utterance();
let uhOh = laugh


// utterances
let mitLaugh(pitch: number, ms: number) {
    music.play(music.createSoundExpression(WaveShape.Sawtooth, 0.7 * pitch, pitch,
        100, 255, 0.9 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Logarithmic), music.PlaybackMode.UntilDone)
    music.play(music.createSoundExpression(WaveShape.Square, pitch, 0.7 * pitch,
        255, 180, 0.1 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
    
}
function emitSnore(ms: number) {
    basic.showIcon(IconNames.Asleep)
    music.play(music.createSoundExpression(WaveShape.Noise, 3508, 715,
        27, 255, 0.5 * ms, SoundExpressionEffect.Vibrato,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
    music.play(music.createSoundExpression(WaveShape.Noise, 847, 5000,
        255, 10, 0.5 * ms, SoundExpressionEffect.Vibrato,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
}
function emitUhOh(pitch: number, ms: number) {
    music.play(music.createSoundExpression(WaveShape.Sawtooth, 1.1 * pitch, 1.4 * pitch,
        100, 255, 0.25 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Logarithmic), music.PlaybackMode.UntilDone)
    basic.pause(0.2 * ms)     // glottal-stop
    music.play(music.createSoundExpression(WaveShape.Square, 1.1 * pitch, pitch,
        255, 180, 0.55 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
}
function emitDoo(pitch: number, ms: number) {
    music.play(music.createSoundExpression(WaveShape.Sawtooth, 3 * pitch, pitch,
        200, 220, 0.05 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Logarithmic), music.PlaybackMode.UntilDone)
    music.play(music.createSoundExpression(WaveShape.Square, pitch, pitch,
        220, 180, 0.95 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
}
// ...stops abruptly
function emitTweet(pitch: number, ms: number) {
    music.play(music.createSoundExpression(WaveShape.Sine, 0.8 * pitch, pitch,
        120, 200, 0.9 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Logarithmic), music.PlaybackMode.UntilDone)
}
function emitWaah(pitch: number, ms: number) {
    music.play(music.createSoundExpression(WaveShape.Sawtooth, pitch, 1.4 * pitch,
        27, 255, 0.2 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Curve), music.PlaybackMode.UntilDone)
    music.play(music.createSoundExpression(WaveShape.Sawtooth, 1.4 * pitch, 1.1 * pitch,
        255, 50, 0.7 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
    music.play(music.createSoundExpression(WaveShape.Sawtooth, 1.1 * pitch, 0.3 * pitch,
        50, 10, 0.1 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
}
function emitGrowl(pitch: number, ms: number) {
    music.play(music.createSoundExpression(WaveShape.Sawtooth, 0.3 * pitch, pitch,
        120, 200, 0.2 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Logarithmic), music.PlaybackMode.UntilDone)
    music.play(music.createSoundExpression(WaveShape.Sawtooth, pitch, 0.95 * pitch,
        200, 255, 0.6 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
    music.play(music.createSoundExpression(WaveShape.Sawtooth, 0.95 * pitch, 0.3 * pitch,
        255, 180, 0.15 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
}



function dumDiDum(repeat: number, period: number) {
    quiet = false
    ave = period / repeat
    pitch = randint(200, 350)
    for (let index = 0; index < repeat; index++) {
        span = randint(0.2 * ave, 1.8 * ave)
        if (span > 0.5 * ave) {
            // mostly "Dum"...
            emitDoo(randint(150, 300), span)
        } else {
            // .. with occasional "Di"
            emitDoo(randint(350, 500), 0.15 * ave)
        }
        basic.pause(100)
    }
    quiet = true
}
function grumble(repeat: number, period: number) {
    quiet = false
    ave = period / repeat
    basic.showIcon(IconNames.Sad)
    for (let index = 0; index < repeat; index++) {
        span3 = randint(0.4 * ave, 1.8 * ave)
        emitUhOh(randint(100, 300), span3)
    }
    quiet = true
}
function giggle(repeat: number, period: number) {
    quiet = false
    ave = period / repeat
    pitch = randint(400, 600)
    for (let index = 0; index < repeat; index++) {
        span2 = randint(0.4 * ave, 1.8 * ave)
        emitLaugh(pitch, span2)
        pitch = 0.9 * pitch
        basic.pause(100)
    }
    quiet = true
}
function whistle(repeat: number, period: number) {
    quiet = false
    ave = period / repeat
    for (let index = 0; index < repeat; index++) {
        span2 = randint(0.4 * ave, 1.8 * ave)
        emitTweet(randint(600, 1200), span2)
        basic.pause(100)
    }
    quiet = true
}



input.onButtonPressed(Button.A, function () {
    if (quiet) {
        whistle(15, 3000)
    }
})
input.onButtonPressed(Button.B, function () {
    if (quiet) {
        dumDiDum(10, 3000)
    }
})
input.onPinPressed(TouchPin.P1, function () {
    if (quiet) {
        grumble(10, 1000)
    }
})
input.onPinPressed(TouchPin.P2, function () {
    if (quiet) {
        for (let index = 0; index < 6; index++) {
            emitSnore(1000)
        }
    }
})
input.onGesture(Gesture.Shake, function () {
    if (quiet) {
        giggle(7, 800)
    }
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (quiet) {
        emitGrowl(300, 500)
    }
})
let quiet = true
let span = 0
let span2 = 0
let pitch = 0
let span3 = 0
let ave = 0
music.setBuiltInSpeakerEnabled(false)
pins.touchSetMode(TouchTarget.P1, TouchTargetMode.Capacitive)
pins.touchSetMode(TouchTarget.P2, TouchTargetMode.Capacitive)
