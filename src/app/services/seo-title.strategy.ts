import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable()
export class SeoTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  private readonly defaultTitle = 'Sismologia ICE | Monitoreo Sismico Nacional';
  private readonly defaultDescription =
    'Plataforma de monitoreo acelerografico y movimiento sismico fuerte del Instituto Costarricense de Electricidad.';

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot) ?? this.defaultTitle;
    const routeData = this.deepestRoute(snapshot.root).data;
    const description = this.textData(routeData, 'description') ?? this.defaultDescription;
    const robots = this.textData(routeData, 'robots') ?? 'index,follow';
    const canonicalUrl = this.canonicalUrl(snapshot.url);

    this.title.setTitle(pageTitle);
    this.setName('description', description);
    this.setName('robots', robots);
    this.setName('twitter:card', 'summary');
    this.setName('twitter:title', pageTitle);
    this.setName('twitter:description', description);
    this.setProperty('og:site_name', 'Sismologia ICE');
    this.setProperty('og:locale', 'es_CR');
    this.setProperty('og:type', 'website');
    this.setProperty('og:title', pageTitle);
    this.setProperty('og:description', description);
    this.setProperty('og:url', canonicalUrl);
    this.setCanonical(canonicalUrl);
  }

  private deepestRoute(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    let activeRoute = route;

    while (activeRoute.firstChild) {
      activeRoute = activeRoute.firstChild;
    }

    return activeRoute;
  }

  private textData(data: Record<string, unknown>, key: string): string | undefined {
    const value = data[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
  }

  private canonicalUrl(routerUrl: string): string {
    const url = new URL(routerUrl || '/', this.document.location.origin);
    url.hash = '';
    url.search = '';
    return url.toString();
  }

  private setName(name: string, content: string): void {
    this.meta.updateTag({ name, content }, `name="${name}"`);
  }

  private setProperty(property: string, content: string): void {
    this.meta.updateTag({ property, content }, `property="${property}"`);
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }
}
