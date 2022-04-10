import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Collection } from 'src/app/core/interfaces/collection';
import { Period } from 'src/app/core/interfaces/course';
import { CollectionService } from 'src/app/core/services/collection/collection.service';
import { CourseService } from 'src/app/core/services/collection/course.service';
import { BaseAdministrationComponent } from '../base-administration/base-administration.component';

@Component({
  selector: 'app-administration-collection',
  templateUrl: './administration-collection.component.html',
  styleUrls: ['./administration-collection.component.scss']
})
export class AdministrationCollectionComponent extends BaseAdministrationComponent implements OnInit {
  collections: Collection[];
  periods: Period[];

  addForm = new FormGroup({
    name: new FormControl('', Validators.required),
    code: new FormControl(null),
    parent: new FormControl(null, Validators.required),
    period: new FormControl(null, Validators.required)
  });

  editForm = new FormGroup({
    name: new FormControl('', Validators.required),
    code: new FormControl(null),
    parent: new FormControl(null, Validators.required),
    period: new FormControl(null, Validators.required)
  });

  constructor(private route: ActivatedRoute,
              modal: NgbModal,
              private collectionService: CollectionService,
              private courseService: CourseService) {
    super(route, modal);
  }

  ngOnInit(): void {
    this.collections = this.route.snapshot.data.collections;
    this.periods = this.route.snapshot.data.periods;
  }

  add() {
    if (this.validateForm(this.addForm)) {
      this.collectionService.addCourse(
        this.addC.parent.value.id,
        this.addC.period.value.id,
        this.addC.name.value,
        this.addC.code.value
      ).subscribe(res => this.collections = res.all);
      this.addForm.patchValue({
        name: '',
        code: null,
        parent: null,
        period: null
      });
      this.finaliseAdd();
    }
   }

   setEditingItem(collection: Collection) {
    super.setEditingItem(collection);

    this.editForm.patchValue({
      name: collection.name,
      code: collection.course_instance?.course.code,
      parent: collection.parent,
      period: collection.course_instance?.period
    });
  }

   edit() {
    if (this.validateForm(this.editForm)) {
      if (this.editForm.dirty) {
        // this.collectionService.edit(
        //   this.editingItem.id,
        //   this.editC.name.value,
        //   this.editC.code.value,
        //   this.editC.parent.value.id,
        //   this.editC.period.value.id
        // ).subscribe((res: Collection) => this.collections = this.overwriteMemory(this.collections, [res]));
      }
      this.finaliseEdit();
    }
   }

   delete() {
    this.collectionService.delete(this.deletingItem.id).subscribe((res: Collection[]) => this.collections = res);
   }

}
