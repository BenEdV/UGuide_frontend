import { Injectable } from '@angular/core';
import { CollectionDataService } from './../collection-data.service';
import { ApiService } from '../../api.service';
import { RouteParamsService } from '../../route-params.service';
import { AuthService } from '../../auth.service';
import { Construct } from '../../../interfaces/construct';
import { Model } from '../../../interfaces/model';
import { ConstructService } from './construct.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ModelService extends CollectionDataService {
  public constructService: ConstructService;

  constructor(private api: ApiService, private routeParamService: RouteParamsService, private authService: AuthService) {
    super(api, routeParamService, authService);
    this.resource = 'models';
  }

  add(name: string, description: string, methodId: number) {
    const payload = {
      name,
      description,
      method: methodId
    };

    return super.addData(payload);
  }

  edit(id: number, name: string, description: string, methodId: number) {
    const payload = {
      name,
      description,
      method: methodId
    };

    return super.editData(id, payload);
  }

  addConstructToModel(modelId: number, construct: Construct) {
    this.withId(modelId).subscribe((model: Model) => model.constructs.push(construct));
  }

  removeConstructFromModels(constructId: number) {
    for (const cacheCollectionId of Object.keys(this.cache)) {
      this.cache[cacheCollectionId].subscribe((models: Model[]) => {
        for (const model of models) {
          const idx = model.constructs.findIndex(c => c.id === constructId);
          model.constructs.splice(idx, 1);
        }
      });
    }
  }

  delete(id: number) {
    return super.delete(id)
      .pipe(
        tap(res => this.constructService.deleteAllConstructsOfModel(id))
      );
  }

}
