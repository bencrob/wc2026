# Performances Optimization

This document gives a list of good practices and tips to help you optimize your Angular code.

## Table of Content

- [Performances Optimization](#performances-optimization)
    - [Table of Content](#table-of-content)
    - [01 - Pipes](#01---pipes)

## 01 - Pipes

### Pure Pipes:

Pure pipes in Angular, like pure functions, are the pipes that always return the same result for the same set of parameters.
Because of that, Angular re-execute these pipes only when their parameters change.

Using a pure pipe allows us to save unnecessary method runs with no changes in the method's arguments.

**So when you can, you MUST use pure pipes to transform your data.**

For example:

This method will be executed on every cycle detection:
</br>

```typescript
@Component({...})
export class MenuPage {

  // THIS WILL RUN ON EVERY CYCLE DETECTION
  public getCountryIcon(countryCode: string): string {
     return countryCode ? `is-${countryCode}` : '';
  }
}
```

</br>

Whereas this transform method in this pipe will only run if `countryCode` has changed.

</br>

```typescript
@Pipe({
    name: 'countryIcon',
})
export class CountryIconPipe implements PipeTransform {
    // THIS WILL RUN ONLY IF COUNTRYCODE HAS CHANGE
    public transform(countryCode: string): string {
        return countryCode ? `is-${countryCode}` : '';
    }
}
```

</br>

### Exceptions

Because it doesn't have to be overkill, you can use methods in template when you need to process very simple conditions:

```typescript
    public displayTimer(isLive: boolean, isBetCard: boolean): boolean {
        return isLive || isBetCard;
    }

    public getCompetitionLink(isInCard: boolean, competitionLink: string[]): string[] {
        return isInCard ? null : competitionLink;
    }
```

### Pipe arguments

</br>

To have the memoization working and not retrigger your pipe every cycle detection, you need to be careful with your pipe's arguments. You can invoke your pipes in 2 different ways in your template.

Arguments in template directly:

```html
<bcdk-breadcrumb-item [img]="competitionId | competitionLogo: width: height: competitionLogoRatio" />
```

OR
<br />
creating an object containing data in the template and use it as a single param to the pipe :

```html
<bcdk-breadcrumb-item
    [img]="{
        id: competitionId,
        width: width,
        height: height,
        ratio: competitionLogoRatio
    } | competitionLogo"
/>
```

Both are working fine with memoization. Second one should probably be prefered when you have more than 2 arguments whereas first one is well readable for 1 or 2 arguments.

</br>
</br>

**!! BE CAREFUL !!** You should only use primitives as arguments (number, string, etc...) or the memoization won't work.

For example the memoization here **will not work**:
</br>

```html
<scoreboards-scoreboard [contestant1]="event.contestants[0] | contestant" />
```

```typescript
@Pipe({
    name: 'contestant',
})
export class ContestantPipe implements PipeTransform {
    public transform(contestant: Contestant): Contestant {
        return {
            displayImage: contestant.display_image,
            name: contestant.name,
            shortName: contestant.short_name,
            id: contestant.id,
        };
    }
}
```

The transform method will be called everytime event is changing since contestant is a sub item of event.

</br>

**WHAT YOU SHOULD DO:**

```html
<scoreboards-scoreboard
    [contestant1]="
        {
            displayImage: event.contestants[0].display_image,
            name: event.contestants[0].name,
            shortName: event.contestants[0].short_name,
            id: event.contestants[0].id,
        } | contestant"
/>
```

```typescript
@Pipe({
    name: 'contestant',
})
export class ContestantPipe implements PipeTransform {
    public transform(contestant: { displayImage: boolean; name: string; shortName: string; id: number }): Contestant {
        return {
            displayImage: contestant.display_image,
            name: contestant.name,
            shortName: contestant.short_name,
            id: contestant.id,
        };
    }
}
```

We are using as argument an Object we are creating ourselves with only primitives in it.
