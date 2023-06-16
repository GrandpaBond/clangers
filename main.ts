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
const volPos = 1



class Utterance {
//properties
    type: VoxType;
    partA: SoundExpression;
    partB: SoundExpression;
    partC: SoundExpression;
    freqFactor0: number;
    freqFactor1: number;
    freqFactor2: number;
    freqFactor3: number;
    volFactor0: number;
    volFactor1: number;
    volFactor2: number;
    volFactor3: number;
    timeFactor1: number;
    timeFactor2: number;
    timeFactor3: number;

    // initally base all three parts on freq=333Hz, vol=222, ms = 999 (333 each)
    constructor(vox: VoxType, freq0: number, vol0: number,
        waveA: WaveShape, fxA: SoundExpressionEffect, shapeA: InterpolationCurve,
        freq1: number, vol1: number, ms1: number,
        waveB: WaveShape, fxB: SoundExpressionEffect, shapeB: InterpolationCurve,
        freq2: number, vol2: number, ms2: number,
        waveC: WaveShape, fxC: SoundExpressionEffect, shapeC: InterpolationCurve,
        freq3: number, vol3: number, ms3: number){

        this.freqFactor0=freq0;
        this.freqFactor1 = freq1;
        this.freqFactor2 = freq2;
        this.freqFactor3 = freq3;
        this.volFactor0 = vol0;
        this.volFactor1 = vol1;
        this.volFactor2 = vol2;
        this.volFactor3 = vol3;
        this.timeFactor1 = ms1;
        this.timeFactor2 = ms2;
        this.timeFactor3 = ms3;

        this.partA = music.createSoundExpression(waveA, freq0 * 333, freq1 * 333,
            vol0 * 222, vol1 * 222, ms1 * 999, fxA, shapeA)

        this.partB = music.createSoundExpression(waveB, freq1 * 333, freq2 * 333,
            vol1 * 222, vol2 * 222, ms2 * 999, fxB, shapeB)

        this.partA = music.createSoundExpression(waveC, freq2 * 333, freq3 * 333,
            vol2 * 222, vol3 * 222, ms3 * 999, fxC, shapeC)
    }
//methods 
    utterUsing(freq: number, vol: number, ms: number){
        // adjust frequencies
        
        }

        // adjust volumes
        // adjust durations
        
    protected setValue(offset: number, value: number, length: number) {
        value = Math.constrain(value | 0, 0, Math.pow(10, length) - 1);
        this.src = this.src.substr(0, offset) + formatNumber(value, length) + this.src.substr(offset + length);
    }

    protected getValue(offset: number, length: number) {
        return parseInt(this.src.substr(offset, length));
    }
}

function formatNumber(num: number, length: number) {
    let result = num + "";
    while (result.length < length) result = "0" + result;
    return result;
}   }




}



// utterances
let moan = new Utterance(VoxType.MOAN, 1.30, 150,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    1.00, 250, 0.60,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,
    0.95, 200, 0.30,
    WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Linear,
    1.15, 133, 0.10);

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

function emitLaugh(pitch: number, ms: number){
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
