import { Directive, ElementRef, TemplateRef, ViewContainerRef, Input, OnDestroy } from '@angular/core';
import { CollectionService } from '../../core/services/collection/collection.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Collection } from 'src/app/core/interfaces/collection';

export type PermissionOperation = 'AND' | 'OR';

@Directive({
  selector: '[appHasPermission]'
})
export class HasPermissionDirective implements OnDestroy {
  private collection: Collection;
  private permissions: string[] = [];
  private logicalOp: PermissionOperation = 'AND';
  private collectionSubscription;
  private elseTemplateRef: TemplateRef<any>;
  private templateAdded = false;
  private elseTemplateAdded = false;

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
  set appHasPermission(val) {
    this.permissions = val || [];
    this.updateView();
  }

  @Input()
  set appHasPermissionOp(operator: PermissionOperation) {
    this.logicalOp = operator;
    this.updateView();
  }

  @Input()
  set appHasPermissionElse(elseTemplateRef: TemplateRef<any>) {
    this.elseTemplateRef = elseTemplateRef;
    this.updateView();
  }

  private updateView() {
    if (this.authService.checkPermissions(this.permissions, this.collection, this.logicalOp)) {
      if (this.elseTemplateAdded) {
        this.viewContainer.clear();
        this.elseTemplateAdded = false;
      }
      if (!this.templateAdded) { // check if element has been added yet to prevent adding it multiple times
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.templateAdded = true;
      }
    } else if (this.elseTemplateRef) {
      if (this.templateAdded) {
        this.viewContainer.clear();
        this.templateAdded = false;
      }
      if (!this.elseTemplateAdded) {
        this.viewContainer.createEmbeddedView(this.elseTemplateRef);
        this.elseTemplateAdded = true;
      }
    } else {
      this.viewContainer.clear();
      this.templateAdded = false;
      this.elseTemplateAdded = false;
    }
  }

  ngOnDestroy() {
    this.collectionSubscription.unsubscribe();
  }

}
