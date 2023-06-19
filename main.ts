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

// code this defensively, in case SoundExpression field-locations change in future
const startVolPos = 1
const startFreqPos = 5
const durationPos = 9
const endVolPos = 26
const endFreqPos = 18

class Utterance {
    //properties
    type: VoxType;
    partA: soundExpression.Sound;
    partB: soundExpression.Sound;
    partC: soundExpression.Sound;
    freqRatio0: number;
    freqRatio1: number;
    freqRatio2: number;
    freqRatio3: number;
    volRatio0: number;
    volRatio1: number;
    volRatio2: number;
    volRatio3: number;
    timeRatio1: number;
    timeRatio2: number;
    timeRatio3: number;
    usingB: boolean;
    usingC: boolean;


    // initally base all three parts on freq=333Hz, vol=222, ms = 999 (333 each)
    constructor(vox: VoxType, freq0: number, vol0: number,
        wave: WaveShape, fx: SoundExpressionEffect, shape: InterpolationCurve, freq1: number, vol1: number, ms1: number) {
        this.freqRatio0 = freq0;
        this.volRatio0 = vol0;
        this.freqRatio1 = freq1;
        this.volRatio1 = vol1;
        this.timeRatio1 = ms1;
        this.partA = new soundExpression.Sound;
        this.partA.src = music.createSoundEffect(wave, 333, 333, 222, 222, 999, fx, shape)
        // until found otherwise...
        this.usingB = false;
        this.usingC = false;
    }
    // (add optional part B)
    usePartB(wave: WaveShape, fx: SoundExpressionEffect, shape: InterpolationCurve, freq2: number, vol2: number, ms2: number) {
        // we have a PartB...
        this.freqRatio2 = freq2;
        this.volRatio2 = vol2;
        this.timeRatio2 = ms2;
        this.partB.src = music.createSoundEffect(wave, 333, 333, 222, 222, 999, fx, shape)
        this.usingC = true
    }
    // (add optional part C)
    usePartC(wave: WaveShape, fx: SoundExpressionEffect, shape: InterpolationCurve, freq3: number, vol3: number, ms3: number) {
        // we have a PartC as well...
        this.freqRatio3 = freq3;
        this.volRatio3 = vol3;
        this.timeRatio3 = ms3;
        this.partA.src = music.createSoundEffect(wave, 333, 333, 222, 222, 999, fx, shape)
        this.usingC = true

    }


    // methods... 
    utterUsing(freq: number, vol: number, ms: number) {
        let loudness = vol * 4 // map from [0...255] into range [0...1023]
        // adjust PartA duration, frequencies and volumes 
        this.partA.src = this.insert(this.partA.src, durationPos, this.formatNumber(ms * this.timeRatio1, 4));
        this.partA.src = this.insert(this.partA.src, startFreqPos, this.formatNumber(freq * this.freqRatio0, 4));
        this.partA.src = this.insert(this.partA.src, startVolPos, this.formatNumber(loudness * this.volRatio0, 4));
        let nextFreqStr = this.formatNumber(freq * this.freqRatio1, 4);
        let nextVolStr = this.formatNumber(loudness * this.volRatio1, 4);
        this.partA.src = this.insert(this.partA.src, endFreqPos, nextFreqStr);
        this.partA.src = this.insert(this.partA.src, endVolPos, nextVolStr);

        if (this.usingB) {
        // adjust PartB duration, frequencies and volumes
            this.partB.src = this.insert(this.partB.src, durationPos, this.formatNumber(ms * this.timeRatio2, 4));
            this.partB.src = this.insert(this.partB.src, startFreqPos, nextFreqStr);
            this.partB.src = this.insert(this.partB.src, startVolPos, nextVolStr);
            nextFreqStr = this.formatNumber(freq * this.freqRatio2, 4);
            nextVolStr = this.formatNumber(loudness * this.volRatio2, 4);
            this.partB.src = this.insert(this.partB.src, endFreqPos, nextFreqStr);
            this.partB.src = this.insert(this.partB.src, endVolPos, nextVolStr);

            if (this.usingC) {
                // adjust PartC duration, frequencies and volumes
                this.partC.src = this.insert(this.partC.src, durationPos, this.formatNumber(ms * this.timeRatio3, 4));
                this.partC.src = this.insert(this.partC.src, startFreqPos, nextFreqStr);
                this.partC.src = this.insert(this.partC.src, startVolPos, nextVolStr);
                this.partC.src = this.insert(this.partC.src, endFreqPos, this.formatNumber(freq * this.freqRatio3, 4));
                this.partC.src = this.insert(this.partC.src, endVolPos, this.formatNumber(loudness * this.volRatio3, 4));
            }
        }
        music.playSoundEffect(this.partA.src, SoundExpressionPlayMode.UntilDone);
        if (this.usingB) {
            music.playSoundEffect(this.partB.src, SoundExpressionPlayMode.UntilDone);
            if (this.usingC) {
                music.playSoundEffect(this.partC.src, SoundExpressionPlayMode.UntilDone);
            }
        }
    }

// internal tools...
    protected formatNumber(num: number, length: number) {
        let result = Math.constrain(num | 0, 0, Math.pow(10, length) - 1) + "";
        while (result.length < length) result = "0" + result;
        return result;
    }
    protected insert(expression: string, offset: number, digits: string): string {
        return expression.substr(0, offset) + digits + expression.substr(offset + digits.length);
    }
}

// declare our utterances
/*
// ...stops abruptly
function emitTweet(pitch: number, ms: number) {
    music.play(music.createSoundExpression(WaveShape.Sine, 0.8 * pitch, pitch,
        120, 200, 0.9 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Logarithmic), music.PlaybackMode.UntilDone)
}
*/
let tweet = new Utterance(VoxType.TWEET, 0.8, 120,WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Logarithmic,1.00, 200, 1.0);
/*
LAUGH	70	100	
SAW	NONE	LOG	100	250	10	
SQU	NONE	LIN	70	180	90
function emitLaugh(pitch: number, ms: number){
    music.play(music.createSoundExpression(WaveShape.Sawtooth, 0.7 * pitch, pitch,
        100, 255, 0.9 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Logarithmic), music.PlaybackMode.UntilDone)
    music.play(music.createSoundExpression(WaveShape.Square, pitch, 0.7 * pitch,
        255, 180, 0.1 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)

}

*/
let laugh = new Utterance(VoxType.LAUGH, 0.70, 100,WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Logarithmic,1.00, 250, 0.1)
    laugh.usePartB(WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Linear, 0.7, 180, 0.9);

/* SNORE -3508	25
NOI	VIB	LIN -715	250	50	
NOI	VIB	LIN - 5000	10	50
function emitSnore(ms: number) {
    basic.showIcon(IconNames.Asleep)
    music.play(music.createSoundExpression(WaveShape.Noise, 3508, 715,
        27, 255, 0.5 * ms, SoundExpressionEffect.Vibrato,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
    music.play(music.createSoundExpression(WaveShape.Noise, 847, 5000,
        255, 10, 0.5 * ms, SoundExpressionEffect.Vibrato,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
}
*/
let snore = new Utterance(VoxType.SNORE, 3508, 150,WaveShape.Noise, SoundExpressionEffect.Vibrato, InterpolationCurve.Linear,715, 250, 0.50)
snore.usePartB(WaveShape.Noise, SoundExpressionEffect.Vibrato, InterpolationCurve.Linear,5008, 10, 0.50);
/*
DOO	300	200	
SAW	NONE	LOG	100	220	95	
SQU	NONE	LIN	100	180	5
function emitDoo(pitch: number, ms: number) {
    music.play(music.createSoundExpression(WaveShape.Sawtooth, 3 * pitch, pitch,
        200, 220, 0.05 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Logarithmic), music.PlaybackMode.UntilDone)
    music.play(music.createSoundExpression(WaveShape.Square, pitch, pitch,
        220, 180, 0.95 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
}

*/
let doo = new Utterance(VoxType.DOO, 3.00, 200,WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Logarithmic,1.00, 220, 0.95)
doo.usePartB(WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Linear,1.00, 180, 0.05);

/*
QUERY	110	50	
SQU	NONE	LIN	100	250	70	
SQU	NONE	CUR	150	50	20
*/
let query = new Utterance(VoxType.QUERY, 1.30, 150,WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Linear,1.00, 250, 0.7)
query.usePartB(WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Curve,1.50, 50, 0.2);


/*
UHOH	110	100	
SAW	NONE	LOG	140	250	20
NON					25	
SQU	NONE	LIN	100	180	55
function emitUhOh(pitch: number, ms: number) {
    music.play(music.createSoundExpression(WaveShape.Sawtooth, 1.1 * pitch, 1.4 * pitch,
        100, 255, 0.25 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Logarithmic), music.PlaybackMode.UntilDone)
    basic.pause(0.2 * ms)     // glottal-stop
    music.play(music.createSoundExpression(WaveShape.Square, 1.1 * pitch, pitch,
        255, 180, 0.55 * ms, SoundExpressionEffect.None,
        InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
}

*/
let uhOh = new Utterance(VoxType.UHOH, 1.30, 150,WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Curve,1.40, 250, 0.2)
uhOh.usePartB(WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Curve,1.40, 250, 0.2)
uhOh.usePartC(WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Linear,1.00, 180, 0.55);

/*
MOAN	130	150
TRI	NONE	CUR	100	250	60	
TRI	NONE	CUR	95	200	30	
TRI	NONE	LIN	115	133	10
*/
let moan = new Utterance(VoxType.MOAN, 1.30, 150,WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,1.00, 250, 0.6)
moan.usePartB(WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,0.95, 200, 0.3)
moan.usePartB(WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Linear,1.15, 133, 0.1);


/*

DUH	100	150	
SQU	NONE	LIN	95	200	30	
SQU	NONE	LIN	110	250	10	
SQU	NONE	LIN	66	90	60
*/
let duh = new Utterance(VoxType.DUH, 1.30, 150,WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,1.00, 250, 0.60)
duh.usePartB(WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,0.95, 200, 0.30)
duh.usePartB( WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Linear, 1.15, 133, 0.10);

/*
WAAH	100	25	
SAW	NONE	CUR	140	250	70	
SAW	NONE	LIN	110	50	20	
SAW	NONE	LIN	30	10	10

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

*/
let waah = new Utterance(VoxType.MOAN, 1.30, 150,WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,1.00, 250, 0.60)
waah.usePartB(WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve,0.95, 200, 0.30)
waah.usePartC(WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Linear,1.15, 133, 0.10);


/*
GROWL	30	120	
SAW	NONE	LOG	100	200	60	
SAW	NONE	LIN	90	250	15	
SAW	NONE	LIN	30	180	15
*/
/*
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
*/
let growl = new Utterance(VoxType.MOAN, 1.30, 150, WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve, 1.00, 250, 0.60)
growl.usePartB( WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve, 0.95, 200, 0.30)
growl.usePartC( WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Linear, 1.15, 133, 0.10);




function dumDiDum(repeat: number, period: number) {
    quiet = false
    ave = period / repeat
    pitch = randint(200, 350)
    for (let index = 0; index < repeat; index++) {
        span = randint(0.2 * ave, 1.8 * ave)
        if (span > 0.5 * ave) {
            // mostly "Dum"...
            doo.utterUsing(randint(150, 300), 1.0, span)
        } else {
            // .. with occasional higher-pitched "Di"
            doo.utterUsing(randint(350, 500), 1.0, 0.15 * ave)
        }
        basic.pause(100)
    }
    quiet = true
}
/*
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
*/

input.onButtonPressed(Button.B, function () {
    if (quiet) {
        dumDiDum(10, 3000)
    }
})
/*
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
})*/
let quiet = true
let span = 0
let span2 = 0
let pitch = 0
let span3 = 0
let ave = 0
music.setBuiltInSpeakerEnabled(false)
pins.touchSetMode(TouchTarget.P1, TouchTargetMode.Capacitive)
pins.touchSetMode(TouchTarget.P2, TouchTargetMode.Capacitive)
