#include <LiquidCrystal.h>

unsigned char clock = 0;
unsigned char alarm = 0;
unsigned char stopwatch = 0;
unsigned char timer = 0;
unsigned char run_stopwatch = 0;
unsigned char run_timer = 0;
unsigned char alarm_enabled = 0;
int inByte;

const int rs = 8, rw = 7, en = 6, d0 = 62, d1 = 63, d2 = 64, d3 = 65, d4 = 66, d5 = 67, d6 = 68, d7 = 69;
LiquidCrystal lcd(rs, rw, en, d0, d1, d2, d3, d4, d5, d6, d7);

typedef struct{
  unsigned char hour, minute, second;
} Time;

Time T1 = {13, 27, 0};
Time T2 = {13, 50, 0};
Time T3 = {0, 0, 0};
Time T4 = {0, 1, 0};

ISR(TIMER1_COMPA_vect) {
  if (++T1.second == 60) {
    T1.second = 0;
    if (++T1.minute == 60) {
      T1.minute = 0;
      if(++T1.hour == 24){
        T1.hour = 0;
      }
    }
  }
  if(clock){
    lcd.clear();
    if(T1.hour < 10) lcd.print("0");
    lcd.print(T1.hour);
    lcd.write(":");
    if(T1.minute < 10) lcd.print("0");
    lcd.print(T1.minute);
    lcd.write(":");
    if(T1.second < 10) lcd.print("0");
    lcd.print(T1.second);
    lcd.setCursor(0, 1);
    lcd.print("Clock");
    lcd.setCursor(0, 0);
    lcd.cursor();
  }
  else if(alarm){
    lcd.clear();
    if(T2.hour < 10) lcd.print("0");
    lcd.print(T2.hour);
    lcd.write(":");
    if(T2.minute < 10) lcd.print("0");
    lcd.print(T2.minute);
    lcd.setCursor(0, 1);
    lcd.print("Alarm");
    lcd.setCursor(0, 0);
    lcd.cursor();
  }
  else if(stopwatch){
    if(run_stopwatch){
      if (++T3.second == 60) {
        T3.second = 0;
        if (++T3.minute == 60) {
          T3.minute = 0;
          if(++T3.hour == 24){
            T3.hour = 0;
          }
        }
      }
    }
    lcd.clear();
    if(T3.hour < 10) lcd.print("0");
    lcd.print(T3.hour);
    lcd.write(":");
    if(T3.minute < 10) lcd.print("0");
    lcd.print(T3.minute);
    lcd.write(":");
    if(T3.second < 10) lcd.print("0");
    lcd.print(T3.second);
    lcd.setCursor(0, 1);
    lcd.print("Stopwatch");
    lcd.setCursor(0, 0);
    lcd.cursor();
  }
  else if(timer){
    if(run_timer){
      if(--T4.second == 255){
        T4.second = 59;
        if(--T4.minute == 255){
          T4.minute = 59;
          if(--T4.hour == 255){
            T4 = {0, 0, 0};
            run_timer = 0;
          }
        }
      }
    }
    lcd.clear();
    if(T4.hour < 10) lcd.print("0");
    lcd.print(T4.hour);
    lcd.write(":");
    if(T4.minute < 10) lcd.print("0");
    lcd.print(T4.minute);
    lcd.write(":");
    if(T4.second < 10) lcd.print("0");
    lcd.print(T4.second);
    lcd.setCursor(0, 1);
    lcd.print("Timer");
    lcd.setCursor(0, 0);
    lcd.cursor();
  }
}

void setup() {

  noInterrupts();

 TCCR1A = 0x00;
 TCCR1B = (1 << WGM12) | (1 << CS12) | (1 << CS10);
 TIMSK1 = (1 << OCIE1A);
 OCR1A = 0x3D08;
 lcd.begin(16,2);
 interrupts();
 Serial.begin(9600);

 DDRC = 0xFF;
 PORTC = 0x00;
}

void loop() {
  if(T2.hour == T1.hour && T2.minute == T1.minute && T1.second == 0 && alarm_enabled == 1){
    for (int i = 0; i <= 5; i++){
        PORTC = 0xFF;
        delay(500);
        PORTC = 0x00;
        delay(200);
      }
  }
  if(T4.hour == 0 && T4.minute == 0 && T4.second == 1 && run_timer){
    delay(1000);
    PORTC = 0xFF;
    delay(500);
    PORTC = 0x00;
  }
  if(Serial.available()){
    inByte = Serial.read();
    if (inByte == 1){
      clock = 1;
      alarm = 0;
      stopwatch = 0;
      timer = 0;
      delay(100);
      if(Serial.available()){
        unsigned char hour = Serial.read();
        unsigned char minute = Serial.read();
        unsigned char second = Serial.read();
        T1.hour = hour;
        T1.minute = minute;
        T1.second = second;
      }
    }
    else if(inByte == 2){
      clock = 0;
      alarm = 1;
      stopwatch = 0;
      timer = 0;
      alarm_enabled = 1;
      delay(100);
      if(Serial.available()){
        unsigned char hour = Serial.read();
        unsigned char minute = Serial.read();
        T2.hour = hour;
        T2.minute = minute;
      }
    }
    else if(inByte == 3){
      clock = 0;
      alarm = 0;
      stopwatch = 1;
      timer = 0;
      delay(100);
      if(Serial.available()){
        unsigned char hour = Serial.read();
        unsigned char minute = Serial.read();
        unsigned char second = Serial.read();
        if(hour == 61) {
          run_stopwatch = 0;
          Serial.write(T3.hour);
          Serial.write(T3.minute);
          Serial.write(T3.second);
          }
        else if(hour == 62){
          Serial.write(T3.hour);
          Serial.write(T3.minute);
          Serial.write(T3.second);
        }
        else{
          run_stopwatch = 1;
          T3.hour = hour;
          T3.minute = minute;
          T3.second = second;
        }
      }
    }
    else if(inByte == 4){
      clock = 0;
      alarm = 0;
      stopwatch = 0;
      timer = 1;
      delay(100);
      if(Serial.available()){
        unsigned char hour = Serial.read();
        unsigned char minute = Serial.read();
        unsigned char second = Serial.read();
        if(hour == 61) {
          run_timer = 0;
          Serial.write(T4.hour);
          Serial.write(T4.minute);
          Serial.write(T4.second);
          }
        else{
          run_timer = 1;
          T4.hour = hour;
          T4.minute = minute;
          T4.second = second;
        }
      }
    }
  }
}