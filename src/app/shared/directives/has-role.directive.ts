import { Directive, ElementRef, TemplateRef, ViewContainerRef, Input, OnDestroy } from '@angular/core';
import { Collection } from 'src/app/core/interfaces/collection';
import { AuthService } from 'src/app/core/services/auth.service';
import { CollectionService } from 'src/app/core/services/collection/collection.service';

export type RoleOperation = 'AND' | 'OR';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective implements OnDestroy {
  private collection: Collection;
  private roles: string[] = [];
  private logicalOp: RoleOperation = 'AND';
  private collectionSubscription;
  private elseTemplateRef: TemplateRef<any>;
  private templateRefAdded = false;
  private elseTemplateRefAdded = false;

  constructor(private element: ElementRef,
              private templateRef: TemplateRef<any>,
              private viewContainer: ViewContainerRef,
              private authService: AuthService,
              private collectionService: CollectionService) {
    this.collectionSubscription = this.collectionService.activeCollection.subscribe(collection => {
      this.collection = collection;
      this.updateView();
    });
  }

  @Input()
  set appHasRole(val) {
    this.roles = val || [];
    this.updateView();
  }

  @Input()
  set appHasRoleOp(operator: RoleOperation) {
    this.logicalOp = operator;
    this.updateView();
  }

  @Input()
  set appHasRoleElse(elseTemplateRef: TemplateRef<any>) {
    this.elseTemplateRef = elseTemplateRef;
    this.updateView();
  }

  private updateView() {
    if (this.authService.checkRoles(this.roles, this.collection, this.logicalOp)) {
      if (this.elseTemplateRefAdded) {
        this.viewContainer.clear();
        this.elseTemplateRefAdded = false;
      }
      if (!this.templateRefAdded) { // check if element has been added yet to prevent adding it multiple times
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.templateRefAdded = true;
      }
    } else if (this.elseTemplateRef) {
      if (this.templateRefAdded) {
        this.viewContainer.clear();
        this.templateRefAdded = false;
      }
      if (!this.elseTemplateRefAdded) {
        this.viewContainer.createEmbeddedView(this.elseTemplateRef);
        this.elseTemplateRefAdded = true;
      }
    } else {
      this.viewContainer.clear();
      this.templateRefAdded = false;
      this.elseTemplateRefAdded = false;
    }
  }

  ngOnDestroy() {
    this.collectionSubscription.unsubscribe();
  }
}
