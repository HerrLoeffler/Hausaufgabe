#include "ExpeditionWorld.h"
FExpQuestion AExpeditionGameMode::QuestionFor(int Id,bool Transfer)const {
 FExpQuestion Q;
 switch(Id){
 case 0:
 Q.Speaker=TEXT("Mara · Hüterin des Dorfes");Q.Hint=TEXT("25 % ist ein Viertel. Teile die Gesamtzahl in vier gleiche Gruppen.");Q.Explanation=TEXT("20 : 4 = 5. Fünf Lichter sind ein Viertel von zwanzig.");
 Q.Prompt=Transfer?TEXT("Noch einmal mit einer neuen Zahl: Wie viel sind 25 % von 12 Lichtern?"):TEXT("Für das Leuchtfeuer brauchen wir 25 % von 20 Lichtern. Wie viele sind das?");
 Q.Options=Transfer?TArray<FString>{TEXT("2"),TEXT("3"),TEXT("4"),TEXT("6")}:TArray<FString>{TEXT("4"),TEXT("5"),TEXT("10"),TEXT("15")};Q.Codes=Q.Options;Q.Correct=1;break;
 case 1:
 Q.Speaker=TEXT("Das Messbecken");Q.Hint=TEXT("Eine Hälfte entspricht zwei Vierteln. Was fehlt zu vier Vierteln?");Q.Explanation=TEXT("1/2 + 1/4 = 3/4. Es fehlt noch 1/4 bis zum vollen Becken.");
 Q.Prompt=Transfer?TEXT("Ein anderes Becken ist zu 1/4 gefüllt. Welcher Anteil fehlt bis zum vollen Becken?"):TEXT("Das Becken enthält 1/2 plus 1/4 seiner Füllmenge. Welcher Anteil fehlt noch bis zum vollen Becken?");
 Q.Options={TEXT("1/4"),TEXT("1/2"),TEXT("3/4"),TEXT("1/8")};Q.Codes=Q.Options;Q.Correct=Transfer?2:0;break;
 case 2:
 Q.Speaker=TEXT("Das Saatbeet");Q.Hint=TEXT("Jeder zweite Samen ist die Hälfte. Teile die Gesamtzahl durch zwei.");Q.Explanation=TEXT("12 : 2 = 6. Sechs Samen wachsen im ersten Beet.");
 Q.Prompt=Transfer?TEXT("Bei 10 Samen soll wieder die Hälfte wachsen. Wie viele sind das?"):TEXT("Im Beet liegen 12 Samen. Die Hälfte soll jetzt wachsen. Wie viele Samen sind das?");
 Q.Options=Transfer?TArray<FString>{TEXT("2"),TEXT("4"),TEXT("5"),TEXT("10")}:TArray<FString>{TEXT("3"),TEXT("4"),TEXT("6"),TEXT("8")};Q.Codes=Q.Options;Q.Correct=2;break;
 case 3:
 Q.Speaker=TEXT("Elin · Kartografin");Q.Hint=TEXT("Ein Viertel entspricht 25 %. Drei Viertel sind drei solcher Teile.");Q.Explanation=TEXT("3 × 25 % = 75 %. Die Strandpforte kennt jetzt deine Übersetzung.");
 Q.Prompt=Transfer?TEXT("Welcher Prozentanteil entspricht 1/4?"):TEXT("Die Strandpforte zeigt 3/4. Wie viel Prozent sind das?");
 Q.Options={TEXT("25 %"),TEXT("50 %"),TEXT("75 %"),TEXT("100 %")};Q.Codes={TEXT("25"),TEXT("50"),TEXT("75"),TEXT("100")};Q.Correct=Transfer?0:2;break;
 case 4:
 Q.Speaker=TEXT("Das Wasseratelier");Q.Hint=TEXT("Schreibe die Hälfte als 2/4. Dann kannst du die Viertel addieren.");Q.Explanation=TEXT("2/4 + 1/4 = 3/4. Die Wellenscheibe löst sich aus dem Becken.");
 Q.Prompt=Transfer?TEXT("Du gibst 1/4 plus 1/4 hinzu. Welchen Anteil hast du zusammen?"):TEXT("Eine Schale enthält 1/2 Liter, die zweite 1/4 Liter. Wie viel Liter sind das zusammen?");
 Q.Options={TEXT("1/4"),TEXT("1/2"),TEXT("3/4"),TEXT("1")};Q.Codes=Q.Options;Q.Correct=Transfer?1:2;break;
 case 5:
 Q.Speaker=TEXT("Die Vorbereitungslampen");Q.Hint=TEXT("25 % ist ein Viertel. Die sechzehn Lampen bilden vier gleich große Gruppen.");Q.Explanation=TEXT("16 : 4 = 4. Vier der sechzehn Lampen leuchten zur Vorbereitung.");
 Q.Prompt=Transfer?TEXT("Wie viele Lampen sind 25 % von 8 Lampen?"):TEXT("In der Ruine stehen 16 Lampen. 25 % sollen zur Vorbereitung leuchten. Wie viele sind das?");
 Q.Options=Transfer?TArray<FString>{TEXT("1"),TEXT("2"),TEXT("4"),TEXT("6")}:TArray<FString>{TEXT("2"),TEXT("4"),TEXT("8"),TEXT("12")};Q.Codes=Q.Options;Q.Correct=1;break;
 case 6:
 Q.Speaker=TEXT("Der Linsensockel");Q.Hint=TEXT("Vergleiche Zwölftel: 3/4 = 9/12 und 2/3 = 8/12.");Q.Explanation=TEXT("9/12 ist größer als 8/12. Deshalb ist 3/4 größer als 2/3. Die Linse ist bereit.");
 Q.Prompt=Transfer?TEXT("Stimmt die Aussage: 9/12 ist größer als 8/12?"):TEXT("Welche Menge ist größer: 3/4 oder 2/3?");
 Q.Options=Transfer?TArray<FString>{TEXT("Ja"),TEXT("Nein")}:TArray<FString>{TEXT("2/3"),TEXT("Beide sind gleich"),TEXT("3/4"),TEXT("Kann man nicht vergleichen")};
 Q.Codes=Transfer?TArray<FString>{TEXT("ja"),TEXT("nein")}:TArray<FString>{TEXT("2/3"),TEXT("gleich"),TEXT("3/4"),TEXT("unbekannt")};Q.Correct=Transfer?0:2;break;
 default:Q.Prompt=TEXT("Diese Station ist noch nicht verfügbar.");break;
 }
 return Q;
}
FExpQuestion AExpeditionGameMode::Question()const{return QuestionFor(CurrentSchool,CurrentSchool>=0&&CurrentSchool<7&&State.pending[CurrentSchool]);}
